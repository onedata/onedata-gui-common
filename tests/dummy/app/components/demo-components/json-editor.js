/**
 * @module components/demo-components/json-editor
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  value: '{"a": "a"}',

  /**
   * @type {string}
   */
  incomingValue: '',

  /**
   * @type {Object}
   */
  incomingObject: undefined,

  /**
   * @type {boolean}
   */
  isValid: undefined,

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  stringifiedObject: computed('incomingObject', function stringifiedObject() {
    return JSON.stringify(this.get('incomingObject'));
  }),

  actions: {
    onChange(res) {
      this.setProperties({
        value: res.value,
        incomingValue: res.value,
        incomingObject: res.parsedValue,
        isValid: res.isValid,
      });
    },
  },
});
