/**
 * A component used internally by the one-dynamic-tree component. For example of
 * tree usage, see one-dynamic-tree documentation.
 * 
 * @module components/one-dynamic-tree/node/field
 * @author Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';
import layout from '../../../templates/components/one-dynamic-tree/node/field';

const {
  computed,
} = Ember;

export default Ember.Component.extend({
  layout,
  tagName: '',

  /**
   * Field definition.
   * To inject.
   * @type {Ember.Object}
   */
  field: null,

  /**
   * Value for field.
   * To inject.
   * @type {*}
   */
  value: null,

  /**
   * If true, field is disabled.
   * To inject.
   * @type {boolean}
   */
  disabled: false,

  /**
   * Input changed action.
   * @type {Function}
   */
  inputChanged: () => {},

  /**
   * Input focused out action.
   * @type {Function}
   */
  focusedOut: () => {},

  /**
   * Input classes.
   * @type {computed.string}
   */
  inputClass: computed('field', function () {
    let field = this.get('field');
    
    let classes = `field-${field.name}`;
    if (field.type !== 'radio-group') {
      classes += ' form-control';
    }
    if (field.type === 'text') {
      classes += ' input-sm';
    }
    return classes;
  }),

  actions: {
    /**
     * Notifies about change in input.
     * @param {string} path Path to the value in the values tree.
     * @param {*} value Changed value.
     */
    inputChanged() {
      this.get('inputChanged')(...arguments);
    },

    /**
     * Notifies about an input focusOut event.
     */
    focusedOut() {
      // prevents double render issue by scheduling focusout event handler on
      // events' loop end
      setTimeout(() => this.get('focusedOut')(), 0);
    }
  }
});
