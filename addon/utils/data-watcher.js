/**
 * A base class for creating object that polls for some data
 *
 * @author Jakub Liput
 * @copyright (C) 2017-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { default as EmberObject, computed } from '@ember/object';
import { set, observer } from '@ember/object';
import { run } from '@ember/runloop';
import Looper from 'onedata-gui-common/utils/looper';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import notImplementedReject from 'onedata-gui-common/utils/not-implemented-reject';

const slowUpdateInterval = 10 * 1000;
const fastUpdateInterval = 5 * 1000;

export default EmberObject.extend({
  /**
   * After init, update is disabled by default
   * @virtual
   * @type {boolean}
   */
  isEnabled: false,

  /**
   * @type {number} in ms
   */
  slowUpdateInterval,

  /**
   * @type {number} in ms
   */
  fastUpdateInterval,

  /**
   * Updated by polling
   * @type {any}
   */
  data: undefined,

  /**
   * Initialized with `_createWatcher`
   * @type {Looper}
   */
  _watcher: undefined,

  /**
   * It true, currently fetching reports from backend
   * Set by some interval watcher
   * @type {boolean}
   */
  isUpdating: undefined,

  /**
   * Error object from fetching status rejection
   * @type {any} typically a request error object
   */
  error: null,

  /**
   * @type {boolean}
   */
  isFastPolling: false,

  /**
   * @type {number}
   */
  _interval: computed('isEnabled', 'isFastPolling', function () {
    if (this.get('isEnabled')) {
      if (this.get('isFastPolling')) {
        return this.get('fastUpdateInterval');
      } else {
        return this.get('slowUpdateInterval');
      }
    } else {
      return null;
    }
  }),

  /**
   * True if loading for the first time after init
   * @type {Ember.ComputedProperty<boolean>}
   */
  isInitializing: computed(
    'status',
    'isUpdating',
    function isInitializing() {
      return this.get('isUpdating') && this.get('data') == null;
    }
  ),

  init() {
    this._super(...arguments);

    this.set('isUpdating', true);

    this._createWatcher();
    this._reconfigureWatcher();

    // get properties to enable observers
    this.get('_interval');
  },

  destroy() {
    try {
      this.get('_watcher').destroy();
    } finally {
      this._super(...arguments);
    }
  },

  _reconfigureWatcher: observer(
    '_interval',
    function _reconfigureWatcher() {
      // debouncing does not let _setCleanWatchersIntervals to be executed multiple
      // times, which can occur for observer
      run.debounce(this, '_setWatcherInterval', 1);
    }
  ),

  /**
   * Create watchers for fetching data
   */
  _createWatcher() {
    const _watcher = Looper.create({
      immediate: true,
    });
    _watcher
      .on('tick', () =>
        safeExec(this, 'updateData')
      );

    this.set('_watcher', _watcher);
  },

  _setWatcherInterval() {
    // this method is invoked from debounce, so it's this can be destroyed
    if (this.isDestroyed === false) {
      const {
        _interval,
        _watcher,
      } = this.getProperties(
        '_interval',
        '_watcher',
      );
      set(_watcher, 'interval', _interval);
    }
  },

  /**
   * It should: update `data` property, change `isUpdating` and set `error`
   * if necessary.
   * @type {function}
   */
  updateData: notImplementedReject,
});
