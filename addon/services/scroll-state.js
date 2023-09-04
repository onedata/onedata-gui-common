/**
 * A global state of page scrolling.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2017-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service from '@ember/service';

/**
 * @typedef {(event: Event) => void} ScrollListener
 */

export default Service.extend({
  /**
   * @type {Event|undefined}
   */
  lastScrollEvent: undefined,

  /**
   * @private
   * @type {Set<ScrollListener>}
   */
  scrollListeners: undefined,

  init() {
    this._super(...arguments);
    this.set('scrollListeners', new Set());
  },

  /**
   * Persists scroll event
   * @param {Event} scrollEvent
   */
  scrollOccurred(scrollEvent) {
    this.set('lastScrollEvent', scrollEvent);
    this.scrollListeners.forEach((listener) => listener(scrollEvent));
  },

  /**
   * @param {ScrollListener} listener
   */
  addScrollListener(listener) {
    this.scrollListeners.add(listener);
  },

  /**
   * @param {ScrollListener} listener
   */
  removeScrollListener(listener) {
    this.scrollListeners.delete(listener);
  },
});
