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
import { inject as service } from '@ember/service';
import { equal, raw } from 'ember-awesome-macros';

export default LinkComponent.extend({
  attributeBindings: ['draggable'],

  browser: service(),

  /**
   * @type {Boolean}
   */
  draggable: undefined,

  /**
   * @type {ComputedProperty<Boolean>}
   */
  isInFirefox: equal('browser.browserName', raw('firefox')),

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
    if (nestedInputs.includes(document.activeElement)) {
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
