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
