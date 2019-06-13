/**
 * Single tab used in one-tab-bar (it's parent component should be 
 * `one-tab-bar/tab-bar-ul`).
 * 
 * @module components/one-tab-bar
 * @author Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from '../../templates/components/one-tab-bar/tab-bar-li';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';

export default Component.extend({
  layout,
  tagName: 'span',
  classNames: ['tab-bar-li'],
  classNameBindings: ['isActive:active'],

  /**
   * Notify parent about click (select) on the tab.
   * @virtual
   * @type {Function} function(clickEvent)
   */
  tabClicked: notImplementedIgnore,

  /**
   * It true, the tab is active (selected).
   * @virtual
   * @type {boolean}
   */
  isActive: false,

  /**
   * Text displayed on the tab.
   * @virtual
   * @type {string}
   */
  name: undefined,

  /**
   * Name of oneicon displayed on the tab.
   * @virtual optional
   * @type {string|undefined}
   */
  icon: undefined,

  actions: {
    anchorClicked(clickEvent) {
      return this.get('tabClicked')(clickEvent);
    },
  },
});
