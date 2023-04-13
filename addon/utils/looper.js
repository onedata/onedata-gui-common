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
 * @copyright (C) 2017-2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject, { observer } from '@ember/object';
import Evented from '@ember/object/evented';
import { cancel, later } from '@ember/runloop';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';

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

  _intervalId: null,

  /**
   * Stores last value of interval to compare with current interval when it changes.
   * @type {number|null}
   */
  lastInterval: undefined,

  //#endregion

  intervalObserver: observer('interval', function intervalObserver() {
    if (this.interval === this.lastInterval) {
      return;
    }
    this.set('lastInterval', this.interval);
    this.restartInterval();
    if (this.interval > 0 && this.immediate) {
      this.notify();
    }
  }),

  init() {
    this._super(...arguments);
    this.intervalObserver();
  },

  destroy() {
    try {
      this.stop();
      cancel(this.get('nextNotifyTimer'));
    } catch (error) {
      console.warn('util:looper: stopping on destroy failed');
    }
    return this._super(...arguments);
  },

  stop() {
    safeExec(this, () => this.set('interval', null));
  },

  notify() {
    this.set(
      'nextNotifyTimer',
      later(() => safeExec(this, () => this.trigger('tick')))
    );
  },

  restartInterval() {
    if (this._intervalId != null) {
      clearInterval(this._intervalId);
    }
    if (this.interval && this.interval > 0) {
      this.set(
        '_intervalId',
        setInterval(this.notify.bind(this), this.interval)
      );
    }
  },
});
