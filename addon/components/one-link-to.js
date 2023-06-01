/**
 * Extends link-to component from Ember and fixes bugs related to inputs
 * inside anchors:
 * 1. It is impossible to change text cursor position with mouse inside input in Firefox.
 *    Solved using `draggable="false"`. See: https://stackoverflow.com/a/31733408 for more.
 * 2. Using `Enter` key inside input causes anchor activation and redirect in Firefox.
 *    Solved by preventing keyDown event when was triggered on input.
 * 3. Some selections using mouse trigger drag event in Chrome and causes
 *    pasting anchor url into the input. Solved by cancelling drag event when input
 *    inside the anchor is active.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import LinkComponent from '@ember/routing/link-component';
import globals from 'onedata-gui-common/utils/globals';
import browser, { BrowserName } from 'onedata-gui-common/utils/browser';

export default LinkComponent.extend({
  attributeBindings: ['draggable'],

  /**
   * @type {Boolean}
   */
  draggable: undefined,

  /**
   * @type {Boolean}
   */
  isInFirefox: browser.name === BrowserName.Firefox,

  init() {
    this._super(...arguments);

    const {
      isInFirefox,
      draggable,
    } = this.getProperties('isInFirefox', 'draggable');
    if (draggable === undefined && isInFirefox) {
      this.set('draggable', false);
    }
  },

  dragStart(event) {
    const nestedInputs = [...this.get('element').querySelectorAll('input')];
    if (nestedInputs.includes(globals.document.activeElement)) {
      event.preventDefault();
      return;
    }

    return this._super(...arguments);
  },

  keyDown(event) {
    if (
      this.get('isInFirefox') &&
      event.key === 'Enter' &&
      event.target.tagName === 'INPUT'
    ) {
      event.preventDefault();
      return;
    }

    return this._super(...arguments);
  },
});
