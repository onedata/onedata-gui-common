/**
 * Shows query block settings
 * 
 * @module components/query-builder/block-settings
 * @author Michał Borzęcki, Jakub Liput
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import { observer } from '@ember/object';
import layout from 'onedata-gui-common/templates/components/query-builder/block-settings';

export default Component.extend({
  layout,

  tagName: '',

  /**
   * @virtual
   * @type {Function}
   */
  onSettingsClose: notImplementedIgnore,

  /**
   * @virtual
   * @type {Function}
   * @param {Utils.QueryBuilder.QueryBlock} newBlock
   */
  onBlockReplace: notImplementedIgnore,

  /**
   * @virtual
   */
  triggerSelector: undefined,

  /**
   * @type {Boolean}
   */
  open: false,

  openObserver: observer('open', function openObserver() {
    if (!this.get('open')) {
      this.get('onSettingsClose')();
    }
  }),

  actions: {
    /**
     * @param {Function} closeSelectorCallback 
     * @param {Utils.QueryBuilder.QueryBlock} newBlock 
     */
    blockReplace(closeSelectorCallback, newBlock) {
      closeSelectorCallback();
      this.get('onBlockReplace')(newBlock);
    },
  },
});
