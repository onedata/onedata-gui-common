/**
 * Allows to scroll the tab bar by clicking on the arrow button.
 * 
 * @module components/one-tab-bar/tab-bar-ul-arrow
 * @author Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from '../../templates/components/one-tab-bar/tab-bar-ul-arrow';
import { computed } from '@ember/object';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';

export default Component.extend({
  layout,
  classNames: ['tab-bar-ul-arrow', 'clickable'],
  classNameBindings: ['directionClass', 'disabled'],

  /**
   * One of: left, right
   * @virtual
   * @type {string}
   */
  direction: 'left',

  /**
   * @virtual
   * @type {Function}
   */
  moveTabs: notImplementedIgnore,

  /**
   * @virtual optional
   * @type {boolean}
   */
  disabled: false,

  /**
   * Delta value for artificial scroll event on tab-bar-ul-container
   * when clicking (or holding) the arrow.
   * @type {number}
   */
  moveDelta: 16,

  /**
   * Interval (ms) for sending artificial scroll event when holding the arrow.
   * @type {number}
   */
  moveInterval: 50,

  /**
   * ID of `setInterval` result for sending artificial scroll events.
   * @type {number}
   */
  mouseDownInterval: undefined,

  directionClass: computed('direction', function directionClass() {
    return `tab-bar-ul-arrow-${this.get('direction')}`;
  }),

  iconName: computed('direction', function iconName() {
    return `arrow-${this.get('direction')}`;
  }),

  startMouseDownInterval() {
    const {
      direction,
      moveDelta,
      moveInterval,
      moveTabs,
    } = this.getProperties('moveDelta', 'moveInterval', 'moveTabs', 'direction');
    this.stopMouseDownInterval();
    moveTabs(direction, moveDelta);
    const mouseDownInterval = setInterval(
      () => moveTabs(direction, moveDelta),
      moveInterval
    );
    this.set('mouseDownInterval', mouseDownInterval);
  },

  stopMouseDownInterval() {
    clearInterval(this.get('mouseDownInterval'));
  },

  willDestroyElement() {
    this._super(...arguments);
    this.stopMouseDownInterval();
  },

  mouseDown( /* mouseEvent */ ) {
    safeExec(this, () => {
      this.startMouseDownInterval();
    });
  },

  mouseUp( /* mouseEvent */ ) {
    safeExec(this, () => {
      this.stopMouseDownInterval();
    })
  },

  mouseLeave() {
    safeExec(this, () => {
      this.stopMouseDownInterval();
    })
  },
});
