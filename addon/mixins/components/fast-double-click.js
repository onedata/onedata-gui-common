/**
 * Allows to handle double click events without need to wait between double
 * clicks like in standard browser's `dblclick` event. For example if clicking:
 * - click
 * - 100 ms
 * - click
 * - -> normally the `dblclick` event occurs
 * - 300 ms
 * - click
 * - 100 ms
 * - click
 * - -> the `dblclick` event is not fired by browser, because there was to short
 *   period between double clicks (300ms)
 * 
 * This mixin invokes `fastDoubleClick` method when component is double clicked
 * without need to wait for this period (in this case 300ms).
 * 
 * If you want to handle also click event please use `super` in `click` handler.
 * 
 * See dummy app demo-component for example.
 * 
 * @module mixins/components/fast-double-click
 * @author Jakub Liput
 * @copyright (C) 2019-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Mixin from '@ember/object/mixin';
import { later, cancel } from '@ember/runloop';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';

export default Mixin.create({
  /**
   * @virtual
   * @type {Function}
   */
  fastDoubleClick: notImplementedIgnore,

  /**
   * Maximum time in ms between two clicks to fire pseudo-double-click event
   * @type {number}
   */
  doubleClickInterval: 400,

  /**
   * @type {number}
   */
  singleClickTimer: 0,

  /**
   * How many times the element was clicked in the `doubleClickInterval`.
   * It is resetted when time is reached.
   */
  singleClickCount: 0,

  willDestroyElement() {
    try {
      cancel(this.get('singleClickTimer'));
    } catch (error) {
      this._super(...arguments);
      throw error;
    }
  },

  click(clickEvent) {
    const doubleClickInterval = this.get('doubleClickInterval');
    this.incrementProperty('singleClickCount');
    const singleClickCount = this.get('singleClickCount');
    if (singleClickCount === 1) {
      const singleClickTimer = later(() => {
        this.set('singleClickCount', 0);
      }, doubleClickInterval);
      this.set('singleClickTimer', singleClickTimer);
    } else if (singleClickCount >= 2) {
      cancel(this.get('singleClickTimer'));
      this.set('singleClickCount', 0);
      this.get('fastDoubleClick')(clickEvent);
    }
  },
});
