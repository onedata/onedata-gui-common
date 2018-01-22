/**
 * A base to create form with one set of fields with optional validation and submit button.
 *
 * It bases on ``one-form``, but got its template that generates simple form.
 *
 * Usage:
 * - create a new component that extends ``one-form-simple`` and uses its layout
 * - set ``fields`` property, that is an array of FieldType (it will be copied)
 * - set ``values`` object with: key (field name) -> value to present data
 * - add ``Validations`` mixin to enable validations
 * - set ``submitButton`` to true/false and ``submitText`` to configure submit button
 *   (by default the button is present)
 * - inject ``submit`` action to handle submit action that sends an object with
 *   field values
 * - inject ``allValidChanged`` action handle validation state changes (whole form
 *   validation)
 *
 * @module components/one-form-simple
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { merge } from '@ember/polyfills';

import ObjectProxy from '@ember/object/proxy';
import { assert } from '@ember/debug';
import { readOnly } from '@ember/object/computed';
import EmberObject, { observer, computed } from '@ember/object';
import { on } from '@ember/object/evented';
import { Promise } from 'rsvp';
import layout from 'onedata-gui-common/templates/components/one-form-simple';
import OneForm from 'onedata-gui-common/components/one-form';
import { invoke, invokeAction } from 'ember-invoke-action';

export default OneForm.extend({
  layout,
  /**
   * To inject.
   * @abstract
   * @type {Array.FieldType}
   */
  fields: null,

  /**
   * To inject.
   * @abstract
   * @type {Ember.Object}
   */
  values: EmberObject.create(),

  currentFieldsPrefix: ['main'],

  /**
   * Will be initialized from injected ``fields``
   * @type {Array.EmberObject}
   */
  allFields: computed('fields', function () {
    let fields = this.get('fields').map(f => EmberObject.create(f));
    fields.filter(field => !field.get('name').startsWith('main.'))
      .forEach(field => field.set('name', 'main.' + field.get('name')));
    return fields;
  }),

  currentFields: readOnly('allFields'),

  allFieldsValues: computed('_values', function () {
    let values = this.get('_values');
    return EmberObject.create({
      main: values,
    });
  }),

  /**
   * Set to true, to render submit button
   * @type {boolean}
   */
  submitButton: true,

  /**
   * Text rendered in submit button
   * @type {string}
   */
  submitText: 'Submit',

  /**
   * If true, all fields and submit button will be disabled
   * @type {boolean}
   */
  _disabled: false,

  /**
   * If true, the submit button will be enabled
   * @type {computed.boolean}
   */
  _submitEnabled: readOnly('validations.isValid'),

  /**
   * Local copy of injected values
   * @type {computed.Ember.Object}
   */
  _values: computed('values', function () {
    return this._getValuesClone();
  }),

  /**
   * If true, the form does not have any real input. It's just a grid for data
   * @type {computed.boolean}
   */
  _hasOnlyStatic: computed('currentFields.@each.type', function () {
    return this.get('currentFields').every(f => f.type === 'static');
  }),

  /**
   * CSS classes for the form element
   * @type {computed.string}
   */
  _formClasses: computed('_hasOnlyStatic', function () {
    let _hasOnlyStatic = this.get('_hasOnlyStatic');
    let classes =
      'col-xs-12 col-sm-10 col-md-8 col-lg-6 col-centered form-horizontal';
    if (_hasOnlyStatic) {
      classes += ' form-static';
    }
    return classes;
  }),

  init() {
    this._super(...arguments);
    this._validateAttributes();
    this.isValidChanged();
    this.prepareFields();
  },

  _validateAttributes() {
    let {
      submitButton,
      fields,
      submit,
    } = this.getProperties('submitButton', 'fields', 'submit');

    assert('fields property should be defined', fields != null);
    assert(
      'submit action should be passed if submit button is enabled', !submitButton ||
      submitButton && submit != null
    );
  },

  _getValuesClone() {
    let valuesProperty = ObjectProxy.detectInstance(this.get('values')) ?
      'values.content' : 'values';
    return merge(EmberObject.create(), this.get(valuesProperty));
  },

  updateValues() {
    this.notifyPropertyChange('_values');
  },

  isValidChanged: on('init', observer('isValid', function () {
    invoke(this, 'allValidChanged', this.get('isValid'));
  })),

  actions: {
    /**
     * Invokes injected ``submit`` action with Ember Object containing
     * values of form. The receiver should know what field to get from it.
     */
    submit() {
      let submitting = this.get('_submitEnabled') ?
        invokeAction(this, 'submit', this.get('allFieldsValues.main')) :
        new Promise((resolve, reject) => reject());
      this.set('_disabled', true);
      submitting.finally(() => {
        this.set('_disabled', false);
      });
      return submitting;
    },

    inputChanged(fieldName, value) {
      this.changeFormValue(fieldName, value);
    },

    focusOut(field) {
      field.set('changed', true);
      this.recalculateErrors();
    },

    allValidChanged(isValid) {
      return invokeAction(this, 'allValidChanged', isValid);
    },
  }
});
