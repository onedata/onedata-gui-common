/**
 * A mixin that provides functionality related to window resize event handling.
 * Version specific for components.
 * 
 * @module mixins/components/window-resize-handler
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Mixin from '@ember/object/mixin';
import { scheduleOnce } from '@ember/runloop';
import WindowResizeHandler from 'onedata-gui-common/mixins/window-resize-handler';

export default Mixin.create(WindowResizeHandler, {
  /**
   * @type {boolean}
   * If true, `onWindowResize` will be called in `didInsertElement` hook
   */
  callWindowResizeHandlerOnInsert: true,

  didInsertElement() {
    this._super(...arguments);

    const {
      _window,
      callWindowResizeHandlerOnInsert,
    } = this.getProperties(
      '_window',
      'callWindowResizeHandlerOnInsert'
    );

    this.attachWindowResizeHandler();
    if (callWindowResizeHandlerOnInsert) {
      scheduleOnce('afterRender', this, 'onWindowResize', {
        target: _window,
      });
    }
  },

  willDestroyElement() {
    try {
      this.detachWindowResizeHandler();
    } finally {
      this._super(...arguments);
    }
  },
});
