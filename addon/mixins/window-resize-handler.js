/**
 * A mixin that provides functionality related to window resize event handling.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2019-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Mixin from '@ember/object/mixin';
import { computed } from '@ember/object';
import { debounce } from '@ember/runloop';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import globals from 'onedata-gui-common/utils/globals';

export default Mixin.create({
  /**
   * Called on each window resize
   * @virtual
   * @param {Event} event resize event object
   * @returns {undefined}
   */
  onWindowResize: notImplementedIgnore,

  /**
   * @type {number}
   * Debounce time for window resize handler
   */
  windowResizeDebounceTime: 100,

  /**
   * @type {Ember.ComputedProperty<Function>}
   * @param {Event} event resize event object
   * @returns {undefined}
   */
  windowResizeHandler: computed(function windowResizeHandler() {
    return (event) => {
      const windowResizeDebounceTime = this.get('windowResizeDebounceTime');
      if (windowResizeDebounceTime) {
        debounce(this, 'onWindowResize', event, windowResizeDebounceTime);
      } else {
        this.onWindowResize(event);
      }
    };
  }),

  attachWindowResizeHandler() {
    globals.window.addEventListener('resize', this.windowResizeHandler);
  },

  detachWindowResizeHandler() {
    globals.window.removeEventListener('resize', this.windowResizeHandler);
  },
});
