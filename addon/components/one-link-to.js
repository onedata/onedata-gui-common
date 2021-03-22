/**
 * Extends link-to component from Ember and fixes bug with text inputs inside
 * links in Firefox. Without that fix, text inputs cannot handle cursor move
 * and text selection by mouse events.
 *
 * @module components/one-link-to
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
  isInFirefox: equal('browser.browser.browserCode', raw('firefox')),

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
