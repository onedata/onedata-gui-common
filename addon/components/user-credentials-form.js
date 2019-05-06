/**
 * A form for displaying basic auth user credentials and modify them 
 *
 * See ``changingPassword`` property to set 
 *
 * @module 
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2017-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject, { computed } from '@ember/object';

import { readOnly } from '@ember/object/computed';
import { htmlSafe } from '@ember/string';
import layout from 'onedata-gui-common/templates/components/user-credentials-form';
import OneForm from 'onedata-gui-common/components/one-form';
import { validator, buildValidations } from 'ember-cp-validations';
import { invokeAction } from 'ember-invoke-action';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import createFieldValidator from 'onedata-gui-common/utils/create-field-validator';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { get, set } from '@ember/object';
import { inject as service } from '@ember/service';

const PASSWORD_DOT = '&#9679';

const SECRET_PASSWORD_FIELD = {
  name: 'secretPassword',
  type: 'static',
};

const CHANGE_PASSWORD_FIELDS = [{
    name: 'currentPassword',
    type: 'password',
  },
  {
    name: 'newPassword',
    type: 'password',
  },
  {
    name: 'newPasswordRetype',
    type: 'password',
  },
];

function createValidations() {
  let validations = {};
  CHANGE_PASSWORD_FIELDS.forEach(field => {
    let thisValidations = validations['allFieldsValues.change.' + field.name] =
      createFieldValidator(field);
    switch (field.name) {
      case 'newPasswordRetype':
        thisValidations.push(validator('confirmation', {
          on: 'allFieldsValues.change.newPassword',
          message: function message() {
            return get(this.get('model').t('retypedNotMatch'), 'string');
          },
        }));
        break;

      default:
        break;
    }
  });
  return validations;
}

const Validations = buildValidations(createValidations());

export default OneForm.extend(Validations, I18n, {
  layout,
  classNames: ['user-credentials-form', 'row'],

  i18n: service(),

  /**
   * One of `password`, `passphrase`
   * @type {string}
   */
  type: 'password',

  /**
   * If true, show form fields and button for chane current password
   * @type {boolean}
   */
  changingPassword: false,

  /**
   * @type {boolean}
   */
  centered: true,

  /**
   * @type {boolean}
   */
  showCancel: false,

  /**
   * @type {Function}
   * @returns {undefined}
   */
  cancel: notImplementedIgnore,

  /**
   * @override
   */
  i18nPrefix: computed('type', function i18nPrefix() {
    const type = this.get('type');
    return `components.userCredentialsForm.${type}`;
  }),

  /**
   * @type {FieldType}
   */
  secretPasswordField: computed(function secretPasswordField() {
    let field = EmberObject.create(this.prepareField(SECRET_PASSWORD_FIELD));
    field.set('name', 'static.' + field.get('name'));
    return field;
  }),

  /**
   * @type {Array.FieldType}
   */
  changePasswordFields: computed(function changePasswordFields() {
    return CHANGE_PASSWORD_FIELDS.map(f => {
      let field = EmberObject.create(this.prepareField(f));
      field.set('name', 'change.' + field.get('name'));
      return field;
    });
  }),

  allFieldsValues: EmberObject.create({
    static: EmberObject.create({
      secretPassword: htmlSafe(PASSWORD_DOT.repeat(5)),
    }),
    change: EmberObject.create({
      currentPassword: null,
      newPassword: null,
      newPasswordRetype: null,
    }),
  }),

  currentFieldsPrefix: computed('changingPassword', function () {
    return this.get('changingPassword') ? ['change'] : ['static'];
  }),

  allFields: computed('changePasswordFields', 'secretPasswordField',
    function allFields() {
      const {
        changePasswordFields,
        secretPasswordField,
      } = this.getProperties(
        'changePasswordFields',
        'secretPasswordField'
      );
      return [secretPasswordField, ...changePasswordFields];
    }),

  submitEnabled: readOnly('validations.isValid'),

  init() {
    this._super(...arguments);
    this.prepareFields();
  },

  prepareField(field) {
    const name = get(field, 'name');
    set(field, 'label', this.t(name));
    return field;
  },

  actions: {
    submit() {
      if (this.get('submitEnabled')) {
        return invokeAction(this, 'submit', {
          currentPassword: this.get('formValues.change.currentPassword'),
          newPassword: this.get('formValues.change.newPassword'),
        });
      }
    },

    cancel() {
      const cancel = this.get('cancel');
      cancel();
    },

    startChangePassword() {
      this.set('changingPassword', true);
    },

    inputChanged(fieldName, value) {
      this.changeFormValue(fieldName, value);
    },

    focusOut(field) {
      field.set('changed', true);
      this.recalculateErrors();
    },
  }
});
