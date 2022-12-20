/**
 * Creates toggle-like checkbox component. Allows to use three-state selection.
 *
 * @module components/one-way-toggle
 * @author Michał Borzęcki, Jakub Liput
 * @copyright (C) 2017-2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { or, conditional, equal, raw } from 'ember-awesome-macros';
import { computed } from '@ember/object';
import { next } from '@ember/runloop';
import layout from 'onedata-gui-common/templates/components/one-way-toggle';
import RecognizerMixin from 'ember-gestures/mixins/recognizers';
import OneCheckboxBase from 'onedata-gui-common/components/one-checkbox-base';
import { inject as service } from '@ember/service';
import computedT from 'onedata-gui-common/utils/computed-t';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import dom from 'onedata-gui-common/utils/dom';

export default OneCheckboxBase.extend(I18n, RecognizerMixin, {
  layout,
  classNames: ['one-way-toggle'],
  classNameBindings: ['_toggleClassFromId'],
  recognizers: 'pan',

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.oneWayToggle',

  /**
   * @virtual optional
   * @type {String}
   */
  tip: undefined,

  /**
   * @virtual optional
   * @type {String}
   */
  icon: undefined,

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

  /**
   * @type {ComputedProperty<String>}
   */
  effectiveTip: conditional(
    equal('tip', raw(undefined)),
    conditional(
      'isReadOnly',
      or('lockHint', computedT('locked')),
      raw(undefined)
    ),
    'tip'
  ),

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
    const inputId = this.get('inputId');
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

    const {
      threeState,
      threeStatesValues,
      allowThreeStateToggle,
      checked,
      element,
    } = this.getProperties(
      'threeState',
      'threeStatesValues',
      'allowThreeStateToggle',
      'checked',
      'element'
    );

    document.getSelection().removeAllRanges();

    const toggleElement = element.querySelector('.one-way-toggle-control');
    if (!toggleElement) {
      return;
    }

    const mouseX = event.originalEvent.gesture.center.x;
    const moveRatio = (mouseX - dom.offset(toggleElement).left) /
      dom.width(toggleElement);
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
