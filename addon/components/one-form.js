/**
 * A base form component with dynamic field generation and validation.
 * 
 * Fields used in that component should be in format:
 * `{ name: 'someName', type: 'text', ...moreFieldOptions }`
 * and be a regular Ember object. See also FieldType type in 
 * components/one-form-fields.
 * 
 * Proper validations mixin should be included to handle validation.
 * Validations object should use fields defined in allFieldsValues, e.g.
 * 'allFieldsValues.somePrefix.someFieldValue': validators...
 * 
 * After all fields setup - usually at the end of init() - prepareFields() 
 * should be called.
 * 
 * The component uses prefixes (sth like namespaces) for grouping fields.
 * It can be used to handle multiple different scenarios of displaying form fields.
 * More inormation about prefixes in comments for commponent fields.
 *
 * @module components/one-form
 * @author Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { empty } from '@ember/object/computed';

import Component from '@ember/component';
import EmberObject, { observer, computed, set } from '@ember/object';
import layout from 'onedata-gui-common/templates/components/one-form';
import config from 'ember-get-config';
import _ from 'lodash';

const {
  layoutConfig,
} = config;

export default Component.extend({
  layout,
  layoutConfig,

  /**
   * Message used as a warning message after unknown field change.
   * @abstract
   * @type {string}
   */
  unknownFieldErrorMsg: 'component:form-component: attempt to change not known input type',

  /**
   * Array of all fields used in the form (both active and inactive)
   * @abstract
   * @type {Array.FieldType}
   * 
   * Field name should start with appropiate prefix. Example:
   * ```
   * [
   *  {name: 'group1.name', type: 'text'},
   *  {name: 'group1.surname', type: 'text', optional: true},
   *  {name: 'group2.city', type: 'text'},
   * ]
   * ```
   */
  allFields: null,

  /**
   * Object with all fields values in the form (both active and inactive).
   * @abstract
   * @type {Ember.Object}
   * 
   * Uses prefixes to distinct different field groups. Almost one group 
   * (prefix) must be defined. Example with two prefixes - group1 and group2:
   * 
   * ```
   * Ember.Object.create({
   *   group1: Ember.Object.create({
   *     name: null,
   *     surname: null,
   *   }),
   *   group2: Ember.Object.create({
   *     city: null
   *   })
   * })
   * ```
   * If there is only one prefix, it is recommended to name it `main`.
   */
  allFieldsValues: null,

  /**
   * @type {Array<string>}
   */
  collapsedPrefixes: Object.freeze([]),

  /**
   * Array of active (visible) form fields (used within current prefixes).
   * @type {Array.Ember.Object}
   */
  currentFields: computed('currentFieldsPrefix.[]', 'allFields', function () {
    let {
      allFields,
      currentFieldsPrefix,
    } = this.getProperties('allFields', 'currentFieldsPrefix');
    let fields = [];
    currentFieldsPrefix.forEach(prefix => {
      let prefixFields = allFields.filter(field =>
        field.get('name').startsWith(`${prefix}.`));
      fields = fields.concat(prefixFields);
    });
    return fields;
  }),

  /**
   * Prefixes for the active groups of fields.
   * @abstract
   * @type {Array.string}
   * 
   * While validation all values from these prefixes are being checked.
   * Example: ``['group1', 'group2']``
   */
  currentFieldsPrefix: Object.freeze([]),

  /**
   * Values of fields in current prefixes. Used in html form.
   * @type {Object}
   * 
   * Object has the same format as allFieldsValues.
   */
  formValues: computed('allFieldsValues', 'currentFieldsPrefix.[]', function () {
    let {
      allFieldsValues,
      currentFieldsPrefix,
    } = this.getProperties('allFieldsValues', 'currentFieldsPrefix');
    let values = EmberObject.create({});
    currentFieldsPrefix
      .forEach(prefix => values.set(prefix, allFieldsValues.get(prefix)));
    return values;
  }),

  /**
   * Array of error objects from ember-cp-validations.
   * @type {Array.Object}
   */
  errors: computed(
    'currentFieldsPrefix',
    'collapsedPrefixes.[]',
    'validations.errors.[]',
    function () {
      let {
        currentFieldsPrefix,
        collapsedPrefixes,
        validations,
      } = this.getProperties(
        'currentFieldsPrefix',
        'collapsedPrefixes',
        'validations'
      );
      let errors = [];
      _.difference(currentFieldsPrefix, collapsedPrefixes).forEach(prefix => {
        let attrPrefix = `allFieldsValues.${prefix}.`;
        errors = errors.concat(validations.get('errors')
          .filter(error => error.get('attribute').startsWith(attrPrefix)));
      });
      return errors;
    }
  ),

  /**
   * Validity status of values from the selected prefix.
   */
  isValid: empty('errors'),

  currentFieldsPrefixObserver: observer('currentFieldsPrefix', function () {
    this.recalculateErrors();
  }),

  /**
   * Sets all fields to its initial state
   */
  prepareFields() {
    let {
      allFields,
    } = this.getProperties('allFields');
    allFields.forEach(field => {
      this._resetField(field);
    });
  },

  /**
   * @param {string} fieldName
   * @returns {FieldType|undefined}
   */
  getField(fieldName) {
    return this.get('allFields').findBy('name', fieldName);
  },

  /**
   * Changes value of specified field
   * @param {string} fieldName field name (with prefix)
   * @param {any} value
   */
  changeFormValue(fieldName, value) {
    let {
      allFieldsValues,
      unknownFieldErrorMsg,
    } = this.getProperties(
      'allFieldsValues',
      'unknownFieldErrorMsg'
    );
    const field = this.getField(fieldName);
    if (field) {
      allFieldsValues.set(fieldName, value);
      set(field, 'changed', true);
      this.recalculateErrors();
    } else {
      console.warn(unknownFieldErrorMsg);
    }
  },

  /**
   * Resets current fields to initial state
   * @param {Array.string} prefixes array of current prefixes, whose values 
   * should be cleared. If not provided, it means all current prefixes.
   */
  resetFormValues(prefixes) {
    let {
      currentFields,
      allFields,
      allFieldsValues,
    } = this.getProperties('currentFields', 'allFields', 'allFieldsValues');
    let fields = currentFields;
    if (prefixes) {
      fields = [];
      prefixes.forEach(prefix => {
        fields = fields.concat(allFields.filter(
          field => field.get('name').startsWith(prefix)
        ));
      });
    }
    fields.forEach(field => {
      allFieldsValues.set(field.get('name'), field.get('defaultValue'));
      this._resetField(field);
    });
  },

  /**
   * Sets validation information for current fields
   */
  recalculateErrors() {
    let {
      currentFields,
      allFieldsValues,
      errors,
    } = this.getProperties('currentFields', 'allFieldsValues', 'errors');

    let prefix = 'allFieldsValues.';
    currentFields.forEach(field => {
      let error = errors
        .filter(error => error.get('attribute') === prefix + field.get('name'));
      error = error.length > 0 ? error[0] : null;
      // show if is not optional or is optional, but not empty
      let showValidation = field.get('optional') !== true || [undefined, null, ''].indexOf(
        allFieldsValues.get(field.get('name'))) === -1;
      if (field.get('changed') && showValidation) {
        field.setProperties({
          isValid: !error,
          isInvalid: !!error,
          message: error ? error.get('message') : '',
        });
      } else {
        field.setProperties({
          isValid: false,
          isInvalid: false,
          message: '',
        });
      }
    });
  },

  /**
   * Resets field to the initial state (not changed, after no validation)
   * @param {string} field
   */
  _resetField(field) {
    field.setProperties({
      changed: false,
      isValid: false,
      isInvalid: false,
      message: '',
    });
  },

  /**
   * Cuts off field name prefix.
   * @param {string} fieldName 
   * @returns {string}
   */
  cutOffPrefix(fieldName) {
    return fieldName.substring(fieldName.indexOf('.') + 1);
  },
});
