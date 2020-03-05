/**
 * A component represents tree node field, used internally by the one-dynamic-tree
 * component. For example of tree usage, see one-dynamic-tree documentation.
 * 
 * @module components/one-dynamic-tree/node/field
 * @author Michal Borzecki
 * @copyright (C) 2017-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';

import { computed } from '@ember/object';
import { dotToDash } from 'onedata-gui-common/helpers/dot-to-dash';
import layout from '../../../templates/components/one-dynamic-tree/node/field';

export default Component.extend({
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

    let classes = `field-${dotToDash([field.name])}`;
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
     * @param {*} value Changed value.
     */
    inputChanged(value) {
      this.get('inputChanged')(value);
    },

    /**
     * Notifies about an input focusOut event.
     */
    focusedOut() {
      this.get('focusedOut')();
    },
  },
});
