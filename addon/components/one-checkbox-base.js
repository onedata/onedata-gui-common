import { or } from '@ember/object/computed';
import Component from '@ember/component';
import { Promise } from 'rsvp';
import { computed } from '@ember/object';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';

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
  classNameBindings: [
    '_disabled:disabled:clickable',
    '_isInProgress:in-progress',
    '_spinnerSideClass',
  ],
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
   * Set this flag to true to force toggle to be in progress state
   * @type {boolean}
   */
  isInProgress: false,

  /**
   * Side, where spinner should be rendered. Values: right, left.
   * @type {string}
   */
  spinnerSide: 'right',

  /**
   * Spinner side css class.
   * @type {computed.string}
   */
  _spinnerSideClass: computed('spinnerSide', function () {
    return this.get('spinnerSide') === 'left' ? 'spinner-left' : '';
  }),

  _disabled: or('_isInProgress', 'isReadOnly'),

  /**
   * A state of check shown when waiting for promise to resolve.
   * Ignores completely check changes when promise is waiting to resolve.
   * @type {boolean|number}
   */
  _checkedWaitState: undefined,

  /**
   * Internal in progress state
   * @type {Ember.ComputedProperty<boolean>}
   */
  _isInProgress: or('isInProgress', '_updateInProgress'),

  /**
   * Flag set internally using promise that is returned by update action
   * @type {boolean}
   */
  _updateInProgress: false,

  /**
   * Action called on input focus out
   * @type {Function}
   */
  onFocusOut: () => {},

  didInsertElement() {
    this._super(...arguments);

    this.$('input')
      .change(() => this._toggle())
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
   * @param {any} value new checkbox value
   * @returns {any} result of injected update function
   */
  _update(value) {
    const updateResult = this.get('update')(value, this);
    if (updateResult instanceof Promise) {
      this.setProperties({
        _updateInProgress: true,
        _checkedWaitState: !this.get('checked'),
      });
      updateResult.finally(() =>
        safeExec(this, function finishCheckboxUpdate() {
          this.setProperties({
            _updateInProgress: false,
            _checkedWaitState: undefined,
          });
        })
      );
    }
    return updateResult;
  },
});
