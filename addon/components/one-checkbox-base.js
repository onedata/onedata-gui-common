import { or } from '@ember/object/computed';
import Component from '@ember/component';
import { Promise } from 'rsvp';
import { computed } from '@ember/object';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import $ from 'jquery';

/**
 * Creates a base for checkbox-like components using the checkbox input.
 * Allows to put checkbox deeper in DOM without worry about value change handling.
 *
 * @module components/one-checkbox-base.js
 * @author Michał Borzęcki, Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

const threeStatesValues = [false, 2, true];
// TODO: VFS-7482 refactor to unchecked (when acceptance tests will be ready)
const threeStatesClasses = ['unselected', 'maybe', 'checked'];
const threeStatesLoop = threeStatesValues.concat(threeStatesValues[0]);
const twoStatesLoop = [
  threeStatesValues[0],
  threeStatesValues[threeStatesValues.length - 1],
  threeStatesValues[0],
];
export default Component.extend({
  classNames: ['one-checkbox-base'],
  classNameBindings: [
    '_disabled:disabled:clickable',
    '_isInProgress:in-progress',
    '_spinnerSideClass',
    '_checkedClass',
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
   * If true, toggle can have three states of selection
   * @type {boolean}
   */
  threeState: false,

  /**
   * If true, third state of selection is accessible for user.
   * Makes sense only if `threeState === true`.
   * @type {boolean}
   */
  allowThreeStateToggle: false,

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
   * @type {Array<any>}
   */
  threeStatesValues,

  /**
   * @type {Array<string>}
   */
  threeStatesClasses,

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
   * Internal lock of toggle
   * @type {boolean}
   */
  _lockToggle: or('isReadOnly', '_isInProgress'),

  /**
   * Checked class name
   * @type {computed.string}
   */
  _checkedClass: computed('_checked', 'threeState', function () {
    const {
      _checked,
      threeState,
      threeStatesClasses,
      threeStatesValues,
    } = this.getProperties(
      '_checked',
      'threeState',
      'threeStatesClasses',
      'threeStatesValues',
    );
    if (threeState) {
      return threeStatesClasses[threeStatesValues.indexOf(_checked)];
    } else {
      return _checked === threeStatesValues[threeStatesValues.length - 1] ?
        threeStatesClasses[2] : threeStatesClasses[0];
    }
  }),

  /**
   * A displayed checkbox state
   * @type {boolean|number} true, false or 2 ("in middle")
   */
  _checked: computed('_isInProgress', 'checked', '_checkedWaitState', function () {
    const {
      _isInProgress,
      checked,
      _checkedWaitState,
    } = this.getProperties('_isInProgress', 'checked', '_checkedWaitState');
    return (checked === 2 && checked) ||
      (_isInProgress ? _checkedWaitState : checked);
  }),

  /**
   * Action called on input focus out
   * @type {Function}
   */
  onFocusOut: () => {},

  didInsertElement() {
    this._super(...arguments);

    $(this.get('element').querySelector('input'))
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
    let {
      _lockToggle,
      checked,
      threeState,
      allowThreeStateToggle,
    } = this.getProperties(
      '_lockToggle',
      'checked',
      'threeState',
      'allowThreeStateToggle',
    );
    if (!_lockToggle) {
      const statesLoop = threeState && allowThreeStateToggle ?
        threeStatesLoop : twoStatesLoop;
      if (!statesLoop.includes(checked)) {
        checked = statesLoop[0];
      }
      this._update(statesLoop[statesLoop.indexOf(checked) + 1]);
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
