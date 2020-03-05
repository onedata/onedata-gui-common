import Component from '@ember/component';
import layout from 'onedata-gui-common/templates/components/one-way-radio-group';
import { invokeAction } from 'ember-invoke-action';

/**
 * Creates radio inputs group based one the one-toggle-radio component.
 *
 * @module components/one-way-radio-group
 * @author Michal Borzecki
 * @copyright (C) 2017-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */
export default Component.extend({
  layout,
  classNames: ['one-way-radio-group'],
  classNameBindings: ['isReadOnly:disabled'],
  attributeBindings: ['dataOption:data-option'],

  /**
   * To inject.
   * Name of the field (used to generate class names for radio inputs)
   * @type {string}
   */
  fieldName: '',

  /**
   * Element ID for first rendered radio input
   * @type {string}
   */
  inputId: null,

  /**
   * If true, user couldn't change value
   * @type {boolean}
   */
  isReadOnly: false,

  /**
   * Optional - data-option attribute for rendered component
   * @type {string}
   */
  dataOption: null,

  /**
   * To inject.
   * A function called, when selected value changes
   * @type {Function}
   */
  update: null,

  /**
   * If true, all labels will have `radio-inline` class (to display them in the one line)
   * @type {boolean}
   */
  radioInline: true,

  actions: {
    updateHandler(value) {
      invokeAction(this, 'update', value, this);
    },
  },
});
