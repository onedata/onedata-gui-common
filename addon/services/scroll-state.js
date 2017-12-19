/**
 * A global state of page scrolling.
 *
 * @module services/scroll-state
 * @author Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';

export default Ember.Service.extend({
  /**
   * @type {Event|undefined}
   */
  lastScrollEvent: undefined,

  /**
   * Persists scroll event
   * @param {Event} scrollEvent 
   */
  scrollOccurred(scrollEvent) {
    this.set('lastScrollEvent', scrollEvent);
  }
});
