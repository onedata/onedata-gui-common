/**
 * A mixin that provides functionality related to window resize event handling.
 * 
 * @module mixins/components/window-resize-handler
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Mixin from '@ember/object/mixin';
import { computed } from '@ember/object';
import { debounce, scheduleOnce } from '@ember/runloop';
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
   * @type {boolean}
   * If true, `onWindowResize` will be called in `didInsertElement` hook
   */
  callWindowResizeHandlerOnInsert: true,

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

  didInsertElement() {
    this._super(...arguments);

    const {
      windowResizeHandler,
      _window,
      callWindowResizeHandlerOnInsert,
    } = this.getProperties(
      'windowResizeHandler',
      '_window',
      'callWindowResizeHandlerOnInsert'
    );

    _window.addEventListener('resize', windowResizeHandler);
    if (callWindowResizeHandlerOnInsert) {
      scheduleOnce('afterRender', this, 'onWindowResize', {
        target: _window,
      });
    }
  },

  willDestroyElement() {
    try {
      const {
        windowResizeHandler,
        _window,
      } = this.getProperties('windowResizeHandler', '_window');

      _window.removeEventListener('resize', windowResizeHandler);
    } finally {
      this._super(...arguments);
    }
  },
});
