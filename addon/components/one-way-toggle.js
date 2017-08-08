import Ember from 'ember';
import layout from 'onedata-gui-common/templates/components/one-way-toggle';
import RecognizerMixin from 'ember-gestures/mixins/recognizers';
import OneCheckboxBase from 'onedata-gui-common/components/one-checkbox-base';
import { invoke } from 'ember-invoke-action';

const {
  run: {
    next,
  },
} = Ember;

/**
 * Creates toggle-like checkbox based one the one-checkbox-base component.
 *
 * @module components/one-way-toggle.js
 * @author Michał Borzęcki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */
export default OneCheckboxBase.extend(RecognizerMixin, {
  layout,
  classNames: ['one-way-toggle'],

  recognizers: 'pan',

  /**
   * If true, click action handler will be disabled
   * (used by pan event handlers)
   * @type {boolean}
   */
  _disableClick: false,

  mouseDown() {
    // prevent from selected text drag-n-drop while panMove
    document.getSelection().removeAllRanges();
  },

  click() {
    if (!this.get('_disableClick')) {
      invoke(this, 'toggle');
    }
  },

  panStart() {
    this.set('_disableClick', true);
  },

  panMove(event) {
    document.getSelection().removeAllRanges();

    let toggleElement = this.$('.one-way-toggle-control');
    let mouseX = event.originalEvent.gesture.center.x;
    let moveRatio = (mouseX - toggleElement.offset().left) /
      toggleElement.outerWidth();

    if (this.get('checked') !== moveRatio > 0.5) {
      invoke(this, 'toggle');
    }
  },

  panEnd() {
    next(() => this.set('_disableClick', false));
  },
});
