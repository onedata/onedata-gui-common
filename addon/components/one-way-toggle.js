/**
 * Creates toggle-like checkbox component. Allows to use three-state selection.
 *
 * @module components/one-way-toggle.js
 * @author Michał Borzęcki, Jakub Liput
 * @copyright (C) 2017-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { or } from '@ember/object/computed';
import { computed } from '@ember/object';
import { next } from '@ember/runloop';
import layout from 'onedata-gui-common/templates/components/one-way-toggle';
import RecognizerMixin from 'ember-gestures/mixins/recognizers';
import OneCheckboxBase from 'onedata-gui-common/components/one-checkbox-base';
import { inject as service } from '@ember/service';

// TODO: handle three state in progress

export default OneCheckboxBase.extend(RecognizerMixin, {
  layout,
  classNames: ['one-way-toggle'],
  classNameBindings: ['_checkedClass', '_toggleClassFromId'],
  recognizers: 'pan',

  i18n: service(),

  /**
   * If true, shows 'lock' icon when toogle is readonly.
   * @type {boolean}
   */
  showLockForReadOnly: true,

  /**
   * A text that will be shown in locked hint (if locked).
   * If not provided, default text will be used.
   * @type {string|ComputedProperty<string>}
   */
  lockHint: undefined,

  _lockHint: computed('lockHint', function _lockHint() {
    return this.get('lockHint') ||
      this.get('i18n').t('components.oneWayToggle.locked');
  }),

  /**
   * If true, click action handler will be disabled
   * (used by pan event handlers)
   * @type {boolean}
   */
  _disableClick: false,

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
  _lockToggle: or('isReadOnly', '_isInProgress'),

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
    if (this.get('_lockToggle')) {
      return;
    }

    let {
      threeState,
      threeStatesValues,
      allowThreeStateToggle,
      checked,
    } = this.getProperties(
      'threeState',
      'threeStatesValues',
      'allowThreeStateToggle',
      'checked'
    );

    document.getSelection().removeAllRanges();

    let toggleElement = this.$('.one-way-toggle-control');
    let mouseX = event.originalEvent.gesture.center.x;
    let moveRatio = (mouseX - toggleElement.offset().left) /
      toggleElement.outerWidth();
    let newValue;
    if (threeState && allowThreeStateToggle) {
      if (moveRatio < 0.33) {
        newValue = threeStatesValues[0];
      } else if (moveRatio < 0.66) {
        newValue = threeStatesValues[1];
      } else {
        newValue = threeStatesValues[2];
      }
    } else {
      if (moveRatio < 0.5) {
        newValue = threeStatesValues[0];
      } else {
        newValue = threeStatesValues[2];
      }
    }
    if (checked !== newValue) {
      this._update(newValue);
    }
  },

  panEnd() {
    next(() => this.set('_disableClick', false));
  },
});
