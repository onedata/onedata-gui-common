/**
 * Extended version of ember-bootstrap tooltip. Adds custom bugfixes.
 *
 * Typical usage:
 * ```
 * {{one-tooltip title="tooltip text" placement="top"}}
 * ```
 *
 * @author Michał Borzęcki
 * @copyright (C) 2017-2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import BsTooltip from 'ember-bootstrap/components/bs-tooltip';
import { inject } from '@ember/service';
import { observer } from '@ember/object';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import config from 'ember-get-config';

export default BsTooltip.extend({
  scrollState: inject(),

  /**
   * If true, the global scrollState will be observed and tooltip will be hidden
   * when user scrolls.
   * @type {boolean}
   */
  hideOnScroll: true,

  /**
   * Hides tooltip on page scroll
   */
  _scrollStateObserver: observer('scrollState.lastScrollEvent', function () {
    const {
      hideOnScroll,
      inDom,
    } = this.getProperties('hideOnScroll', 'inDom');
    if (hideOnScroll && inDom) {
      this.hide();
    }
  }),

  init() {
    this._super(...arguments);
    this.get('scrollState');

    if (config.environment === 'test') {
      this.setProperties({
        fade: false,
        delay: 0,
      });
    }
  },

  /**
   * @override
   */
  _show() {
    const args = arguments;

    // Bugfix: surround `_show` method with `safeExec` to avoid
    // "set on destroyed object" error.
    return safeExec(this, () => {
      // Bugfix: fast changing `visible` property not closes tooltip.
      //
      // Bug description: when changing a tooltip visibility manually via `visible`
      // property, there were cases when tooltip stayed open even when `visible` was
      // false. It was caused by `_watchVisible` observer calling `show()` which
      // then schedules running `_show()`. That scheduling runs `_show()` asynchronously
      // and it was possible to change `visible` value to `false` between scheduling
      // and running `_show()`. `_show()` does not have any checks regarding
      // current value of `visible` hence it opens tooltip regardless `visible === false`.
      //
      // Additional `!hoverState` is needed to be sure, that showing tooltip
      // was triggered manually (via `visible` change) and not by an event.
      // When showing tooltip via event (mouse hover etc.) `visible` property
      // can be `false` and that's correct.
      const {
        visible,
        hoverState,
      } = this.getProperties('visible', 'hoverState');

      if (!visible && !hoverState) {
        // Only `return` is not enough here - it leaves rendered (but transparent)
        // tooltip, which overlays page content.
        this.hide();
        return;
      }
      // End of the "fast changing `visible` property not closes tooltip" bugfix

      this._super(...args);
    });
  },
});
