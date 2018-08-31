/**
 * Displays the human-readable amount of time elapse from the `date`
 * and updates it automatically
 * 
 * @module components/time-from-now
 * @author Jakub Liput
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from '../templates/components/time-from-now';
import moment from 'moment';
import Looper from 'onedata-gui-common/utils/looper';
import computedPipe from 'onedata-gui-common/utils/ember/computed-pipe';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';

export default Component.extend({
  layout,
  tagName: 'span',
  classNames: ['time-from-now'],

  /**
   * @virtual
   * @type {moment|string}
   */
  date: undefined,

  /**
   * @virtual optional
   * An interval in which the date string will be updated in ms
   * @type {Number}
   */
  updateInterval: 20000,

  dateMoment: computedPipe('date', moment),

  timeFromNow: undefined,

  updateTime() {
    const timeFromNow = this.get('dateMoment').fromNow()
    safeExec(this, 'set', 'timeFromNow', timeFromNow);
  },

  init() {
    this._super(...arguments);
    const timeUpdater = this.set('timeUpdater', new Looper({
      immediate: false,
      interval: this.get('updateInterval'),
    }));
    this.updateTime();
    timeUpdater.on('tick', () => this.updateTime());
  },

  destroy() {
    try {
      const timeUpdater = this.get('timeUpdater');
      if (timeUpdater) {
        timeUpdater.destroy();
      }
    } finally {
      this._super(...arguments);
    }
  },
});
