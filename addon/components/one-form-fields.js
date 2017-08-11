/**
 * Generate Bootstrap Form fields using lists of FieldTypes
 *
 * @module components/one-form-fields
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';
import layout from 'onedata-gui-common/templates/components/one-form-fields';
import { invokeAction } from 'ember-invoke-action';
import config from 'ember-get-config';

const {
  layoutConfig
} = config;

/**
 * @typedef {Object} FieldType
 * @property {string} name
 * @property {string} type
 * @property {boolean} [optional=undefined]
 * @property {*} [defaultValue=undefined]
 * @property {string} [label=undefined]
 * @property {boolean} [nolabel=undefined] disable label for input
 * @property {string} [placeholder=undefined]
 * @property {string} [example=undefined]
 * @property {string} [tip=undefined]
 * @property {number} [step=undefined] step in number inputs
 */

export default Ember.Component.extend({
  layout,
  tagName: '',
  layoutConfig,

  /**
   * @type {ember-bootstrap.Components.FormGroup}
   */
  bsForm: null,

  /**
   * @type {Ember.Object}
   */
  formValues: null,

  /**
   * @type {FieldType}
   */
  fields: null,

  actions: {
    inputChanged() {
      invokeAction(this, 'inputChanged', ...arguments);
    },
    onFocusOut() {
      invokeAction(this, 'onFocusOut', ...arguments);
    }
  },
});
