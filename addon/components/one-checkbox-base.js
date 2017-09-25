import Ember from 'ember';

const {
  Component,
} = Ember;

/**
 * Creates a base for checkbox-like components using the one-way-checkbox component.
 * Allows to put checkbox deeper in DOM without worry about value change handling.
 *
 * @module components/one-checkbox-base.js
 * @author Michał Borzęcki, Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */
export default Component.extend({
  classNames: ['one-checkbox-base'],
  classNameBindings: ['isReadOnly:disabled:clickable'],
  attributeBindings: ['dataOption:data-option'],

  /**
   * Element ID for rendered invisible input element
   * @type {string}
   */
  inputId: null,

  /**
   * If true, toggle is in enabled state
   * @type {boolean}
   */
  checked: false,

  /**
   * If true, user couldn't change value of toggle
   * @type {boolean}
   */
  isReadOnly: false,

  /**
   * Optional - data-option attribute for rendered component
   * @type {string}
   */
  dataOption: null,

  /**
   * Action called on value change (with new value and component instance)
   * @type {Function}
   */
  update: () => {},

  /**
   * Action called on input focus out
   * @type {Function}
   */
  onFocusOut: () => {},

  didInsertElement() {
    this._super(...arguments);

    this.$('input').change(() => this._toggle())
      .focusout(() => this.get('onFocusOut')())
      // Fix for Firefox to handle toggle change by 
      // label-click and keyboard change on active input
      .click((event) => event.stopImmediatePropagation());
  },

  click() {
    this._toggle();
  },

  /**
   * Toggles checkbox value
   */
  _toggle() {
    if (!this.get('isReadOnly')) {
      this._update(!this.get('checked'));
    }
  },

  /**
   * Notifies about new value.
   * @param {*} value new checkbox value 
   */
  _update(value) {
    this.get('update')(value, this);
  },

  actions: {
    toggle() {
      this._toggle();
    }
  }
});
