/**
 * A mixin that provides functionality related to window resize event handling.
 * Version specific for components.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Mixin from '@ember/object/mixin';
import { scheduleOnce } from '@ember/runloop';
import WindowResizeHandler from 'onedata-gui-common/mixins/window-resize-handler';
import globals from 'onedata-gui-common/utils/globals';

export default Mixin.create(WindowResizeHandler, {
  /**
   * @type {boolean}
   * If true, `onWindowResize` will be called in `didInsertElement` hook
   */
  callWindowResizeHandlerOnInsert: true,

  didInsertElement() {
    this._super(...arguments);

    this.attachWindowResizeHandler();
    if (this.callWindowResizeHandlerOnInsert) {
      scheduleOnce('afterRender', this, 'onWindowResize', {
        target: globals.window,
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
