/**
 * A form for displaying basic auth user credentials and modify them 
 *
 * See ``changingPassword`` property to set 
 *
 * @module 
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject, { computed } from '@ember/object';

import { readOnly } from '@ember/object/computed';
import { htmlSafe } from '@ember/string';
import layout from 'onedata-gui-common/templates/components/user-credentials-form';
import OneForm from 'onedata-gui-common/components/one-form';
import { validator, buildValidations } from 'ember-cp-validations';
import { invokeAction } from 'ember-invoke-action';
import createFieldValidator from 'onedata-gui-common/utils/create-field-validator';

const PASSWORD_DOT = '&#9679';

// TODO i18n

const SECRET_PASSWORD_FIELD = {
  name: 'secretPassword',
  label: 'Password',
  type: 'static',
};

const CHANGE_PASSWORD_FIELDS = [{
    name: 'currentPassword',
    label: 'Current password',
    type: 'password',
  },
  {
    name: 'newPassword',
    label: 'New password',
    type: 'password',
  },
  {
    name: 'newPasswordRetype',
    label: 'Retype new password',
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
        // TODO i18n    
        thisValidations.push(validator('confirmation', {
          on: 'allFieldsValues.change.newPassword',
          message: 'Retyped password does not match'
        }));
        break;

      default:
        break;
    }
  });
  return validations;
}

const Validations = buildValidations(createValidations());

export default OneForm.extend(Validations, {
  layout,
  classNames: ['user-credentials-form'],

  username: null,

  /**
   * If true, show form fields and button for chane current password
   * @type {boolean}
   */
  changingPassword: false,

  /**
   * @type {FieldType}
   */
  secretPasswordField: computed(() => {
    let field = EmberObject.create(SECRET_PASSWORD_FIELD);
    field.set('name', 'static.' + field.get('name'));
    return field;
  }).readOnly(),

  /**
   * @type {Array.FieldType}
   */
  changePasswordFields: computed(() => CHANGE_PASSWORD_FIELDS.map(f => {
    let field = EmberObject.create(f);
    field.set('name', 'change.' + field.get('name'));
    return field;
  })).readOnly(),

  allFieldsValues: EmberObject.create({
    generic: EmberObject.create({
      username: null,
    }),
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
    return this.get('changingPassword') ? ['generic', 'change'] : ['generic',
      'static'
    ];
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
    this.set('formValues.generic.username', this.get('username'));
    this.prepareFields();
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
