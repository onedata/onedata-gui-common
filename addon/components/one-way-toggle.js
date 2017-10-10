/**
 * Creates toggle-like checkbox component. Allows to use three-state selection.
 *
 * @module components/one-way-toggle.js
 * @author Michał Borzęcki, Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';
import layout from 'onedata-gui-common/templates/components/one-way-toggle';
import RecognizerMixin from 'ember-gestures/mixins/recognizers';
import OneCheckboxBase from 'onedata-gui-common/components/one-checkbox-base';

const {
  computed,
  run: {
    next,
  },
  observer,
} = Ember;

const THREE_STATES = [false, 2, true];
const THREE_STATES_CLASSES = ['', 'maybe', 'checked'];

// TODO: handle three state in progress

export default OneCheckboxBase.extend(RecognizerMixin, {
  layout,
  classNames: ['one-way-toggle'],
  classNameBindings: ['_checkedClass', '_toggleClassFromId'],
  recognizers: 'pan',

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
   * If true, click action handler will be disabled
   * (used by pan event handlers)
   * @type {boolean}
   */
  _disableClick: false,

  /**
   * Checked class name
   * @type {computed.string}
   */
  _checkedClass: computed('_checked', 'threeState', function () {
    let {
      _checked,
      threeState,
    } = this.getProperties('_checked', 'threeState');
    if (threeState) {
      return THREE_STATES_CLASSES[THREE_STATES.indexOf(_checked)];
    } else {
      return _checked === THREE_STATES[THREE_STATES.length - 1] ?
        THREE_STATES_CLASSES[2] : THREE_STATES_CLASSES[0];
    }
  }),

  /**
   * A displayed checkbox state
   * @type {boolean|number} true, false or 2 ("in middle")
   */
  _checked: computed('_isInProgress', 'checked', function () {
    const {
      _isInProgress,
      checked,
    } = this.getProperties('_isInProgress', 'checked');
    return (checked === 2 && checked) || (_isInProgress ? !checked : checked);
  }),

  // FIXME: to remove
  _cchanged: observer('_checked', function () {
    console.log('_checked chaged:', this.get('_checked'));
  }),

  /**
   * Toggle class from input id.
   * @type {computed.string}
   */
  _toggleClassFromId: computed('inputId', function () {
    let inputId = this.get('inputId');
    return inputId ? inputId + '-toggle' : '';
  }),

  /**
   * Internal lock of toggle
   * @type {boolean}
   */
  _lockToggle: computed.or('isReadOnly', '_isInProgress'),

  mouseDown() {
    // prevent from selected text drag-n-drop while panMove
    document.getSelection().removeAllRanges();
  },

  click(event) {
    event.stopPropagation();
    if (!this.get('_disableClick')) {
      this._toggle();
    }
  },

  panStart() {
    this.set('_disableClick', true);
  },

  panMove(event) {
    let {
      threeState,
      allowThreeStateToggle,
      checked,
    } = this.getProperties('threeState', 'allowThreeStateToggle', 'checked');

    document.getSelection().removeAllRanges();

    let toggleElement = this.$('.one-way-toggle-control');
    let mouseX = event.originalEvent.gesture.center.x;
    let moveRatio = (mouseX - toggleElement.offset().left) /
      toggleElement.outerWidth();
    let newValue;
    if (threeState && allowThreeStateToggle) {
      if (moveRatio < 0.33) {
        newValue = THREE_STATES[0];
      } else if (moveRatio < 0.66) {
        newValue = THREE_STATES[1];
      } else {
        newValue = THREE_STATES[2];
      }
    } else {
      if (moveRatio < 0.5) {
        newValue = THREE_STATES[0];
      } else {
        newValue = THREE_STATES[2];
      }
    }
    if (checked !== newValue) {
      this._update(newValue);
    }
  },

  panEnd() {
    next(() => this.set('_disableClick', false));
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
      'allowThreeStateToggle'
    );
    if (!_lockToggle) {
      let statesLoop = threeState && allowThreeStateToggle ?
        THREE_STATES.concat(THREE_STATES[0]) : [THREE_STATES[0], THREE_STATES[
          THREE_STATES.length - 1], THREE_STATES[0]];
      if (statesLoop.indexOf(checked) === -1) {
        checked = statesLoop[0];
      }
      this._update(statesLoop[statesLoop.indexOf(checked) + 1]);
    }
  },
});
