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

import EmberObject, { computed, observer } from '@ember/object';
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

const VERIFY_PASSWORD_FIELD = {
  name: 'currentPassword',
  type: 'password',
};

const CHANGE_PASSWORD_FIELDS = [
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
  const validations = {};

  validations['allFieldsValues.verify.' + get(VERIFY_PASSWORD_FIELD, 'name')] =
    createFieldValidator(VERIFY_PASSWORD_FIELD);
  
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
   * If true, user will be asked for current password
   * @type {boolean}
   */
  verifyCurrentPassword: true,

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
   * @type {FieldType}
   */
  verifyPasswordField: computed(function verifyPasswordField() {
    const field = EmberObject.create(this.prepareField(VERIFY_PASSWORD_FIELD));
    field.set('name', 'verify.' + field.get('name'));
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

  /**
   * @override
   */
  allFieldsValues: computed(function allFieldsValues() {
    return EmberObject.create({
      static: EmberObject.create({
        secretPassword: htmlSafe(PASSWORD_DOT.repeat(5)),
      }),
      verify: EmberObject.create({
        currentPassword: null,
      }),
      change: EmberObject.create({
        newPassword: null,
        newPasswordRetype: null,
      }),
    });
  }),

  /**
   * @override
   */
  currentFieldsPrefix: computed(
    'changingPassword',
    'verifyCurrentPassword',
    function currentFieldsPrefix() {
    const {
      changingPassword,
      verifyCurrentPassword,
    } = this.getProperties('changingPassword', 'verifyCurrentPassword');
    if (changingPassword) {
      if (verifyCurrentPassword) {
        return ['verify', 'change'];
      } else {
        return ['change'];
      }
    } else {
      return ['static'];
    }
  }),

  /**
   * @override
   */
  allFields: computed(
    'changePasswordFields',
    'secretPasswordField',
    'verifyPasswordField',
    function allFields() {
      const {
        changePasswordFields,
        secretPasswordField,
        verifyPasswordField,
      } = this.getProperties(
        'changePasswordFields',
        'secretPasswordField',
        'verifyPasswordField'
      );
      return [secretPasswordField, verifyPasswordField, ...changePasswordFields];
    }
  ),

  changingPasswordObserver: observer(
    'changingPassword',
    function changingPasswordObserver() {
      const changingPassword = this.get('changingPassword');
      if (changingPassword) {
        this.resetFormValues(['verify', 'change']);
      }
    }
  ),

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
      const {
        isValid,
        verifyCurrentPassword,
      } = this.getProperties('isValid', 'verifyCurrentPassword')
      if (isValid) {
        const values = {
          newPassword: this.get('formValues.change.newPassword'),
        };
        if (verifyCurrentPassword) {
          set(
            values,
            'currentPassword',
            this.get('formValues.verify.currentPassword')
          );
        }
        return invokeAction(this, 'submit', values);
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
