/**
 * An Ember class to maintain a single interval with an object
 *
 * Usage:
 * - set `interval` property (on create or whenever in runtime)
 * - bind `tick` event to any function to invoke on interval (`on('tick', function)`)
 * - remember to call `stop` method or `destroy` when want to stop interval
 * - `interval` can be always changed - it will start new interval timer and clear old
 *
 * @author Jakub Liput
 * @copyright (C) 2017-2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject, { computed, trySet } from '@ember/object';
import Evented from '@ember/object/evented';
import { cancel, later } from '@ember/runloop';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import { syncObserver } from 'onedata-gui-common/utils/observer';

export default EmberObject.extend(Evented, {
  /**
   * Time in milliseconds between the `tick` event (callback invocation).
   * @virtual optional
   * @type {number|null}
   */
  interval: null,

  /**
   * If true, the tick notify will be launched right after changing interval
   * @virtual optional
   * @type {boolean}
   */
  immediate: false,

  //#region state

  /**
   * @type {any}
   */
  nextNotifyTimer: undefined,

  /**
   * ID of the current interval timer.
   * @type {any}
   */
  _intervalId: null,

  /**
   * Stores last value of interval to compare with current interval when it changes.
   * @type {number|null}
   */
  lastInterval: undefined,

  /**
   * If true, the timer will be always off, no matter of `interval` value.
   */
  isStopped: false,

  //#endregion

  /**
   * Interval time in ms used in the current timer.
   * @type {ComputedProperty<number>}
   */
  _interval: computed('interval', 'isStopped', function _interval() {
    return this.isStopped ? 0 : this.interval;
  }),

  /**
   * Sync: a lot of code uses loopers which immediately changed the timer after interval
   * change, so for now we don't change it to async observer (but it is still possible
   * in the future if the change will be well-tested).
   */
  intervalObserver: syncObserver('_interval', function intervalObserver() {
    if (this._interval === this.lastInterval) {
      return;
    }
    // do not use set to not unnecessarily trigger observing code
    this.lastInterval = this._interval;
    this.restartInterval();
    if (this._interval > 0 && this.immediate) {
      this.notify();
    }
  }),

  init() {
    this._super(...arguments);
    this.intervalObserver();
  },

  /**
   * @override
   */
  willDestroy() {
    try {
      this.stop();
    } catch (error) {
      console.warn('util:looper: stopping on destroy failed');
    }
    return this._super(...arguments);
  },

  stop() {
    cancel(this.nextNotifyTimer);
    trySet(this, 'isStopped', true);
    this.clearInterval();
  },

  notify() {
    this.set(
      'nextNotifyTimer',
      later(() => safeExec(this, () => {
        this.trigger('tick');
      }))
    );
  },

  restartInterval() {
    this.clearInterval();
    if (this._interval > 0) {
      this.set(
        '_intervalId',
        setInterval(this.notify.bind(this), this._interval)
      );
    }
  },

  clearInterval() {
    cancel(this.nextNotifyTimer);
    clearInterval(this._intervalId);
    trySet(this, '_intervalId', null);
  },
});
