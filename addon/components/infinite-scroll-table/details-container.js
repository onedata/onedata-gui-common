/**
 * Renders details container for selected `entry`. Is visible on screen
 * when `entry` is non-empty.
 *
 * This component does not close by itself. It calls `onClose` when user tries
 * to close it and then (if you want to close it) you should clear `entry` value.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { observer } from '@ember/object';
import layout from 'onedata-gui-common/templates/components/infinite-scroll-table/details-container';

export default Component.extend({
  layout,
  classNames: ['details-container'],
  classNameBindings: ['entry:visible'],

  /**
   * Entry to show details. This component is visible only if `entry` is
   * not empty.
   * @virtual
   * @type {InfiniteScrollEntry|undefined}
   */
  entry: undefined,

  /**
   * Called when a user tries to close the details. This component does not close
   * itself autonomously - you have to clear `entry` property to close it.
   * @virtual
   * @type {() => void}
   */
  onClose: undefined,

  /**
   * Latest non-empty value of `entry`. It is the main source of data to display.
   * Becacuse of that, view will always be non-empty even when `entry` becomes
   * empty and details view starts to hide.
   * @type {InfiniteScrollEntry|undefined}
   */
  latestEntry: undefined,

  entryObserver: observer('entry', function entryObserver() {
    // Persist `entry` in `latestEntry`
    if (this.entry) {
      this.set('latestEntry', this.entry);
    }
  }),
});
