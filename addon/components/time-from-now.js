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

  /**
   * @type {boolean}
   * If true, component will render `2 seconds ago` instead of `a few seconds ago`
   */
  showIndividualSeconds: false,

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

  updateTime() {
    const showIndividualSeconds = this.get('showIndividualSeconds');

    let oldSsThreshold;
    if (showIndividualSeconds) {
      oldSsThreshold = moment.relativeTimeThreshold('ss');
      moment.relativeTimeThreshold('ss', -1);
    }

    let timeFromNow;
    try {
      timeFromNow = this.get('dateMoment').fromNow()
    } finally {
      if (showIndividualSeconds) {
        moment.relativeTimeThreshold('ss', oldSsThreshold);
      }
    }

    safeExec(this, 'set', 'timeFromNow', timeFromNow);
  },
});
