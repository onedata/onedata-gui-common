/**
 * A global state of page scrolling.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2017-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service from '@ember/service';

export default Service.extend({
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
  },
});
