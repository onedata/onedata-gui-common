/**
 * A mixin that provides functionality related to window resize event handling.
 * 
 * @module mixins/window-resize-handler
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Mixin from '@ember/object/mixin';
import { computed } from '@ember/object';
import { debounce } from '@ember/runloop';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';

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
   * @type {Window}
   */
  _window: window,

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
    }
  }),

  attachWindowResizeHandler() {
    const {
      windowResizeHandler,
      _window,
    } = this.getProperties(
      'windowResizeHandler',
      '_window'
    );

    _window.addEventListener('resize', windowResizeHandler);
  },

  detachWindowResizeHandler() {
    const {
      windowResizeHandler,
      _window,
    } = this.getProperties(
      'windowResizeHandler',
      '_window'
    );

    _window.removeEventListener('resize', windowResizeHandler);
  },
});
