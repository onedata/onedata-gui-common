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
import { computed } from '@ember/object';
import layout from 'onedata-gui-common/templates/components/query-builder/block-settings';
import { tag } from 'ember-awesome-macros';

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
   * @type {Utils.OperatorQueryBlock}
   */
  parentQueryBlock: null,

  /**
   * @virtual
   */
  triggerSelector: undefined,

  /**
   * @type {Boolean}
   */
  open: false,

  /**
   * @type {ComputedProperty<String>}
   */
  parentSelector: computed('parentView.elementId', function parentSelector() {
    const parentId = this.get('parentView.elementId');
    if (parentId) {
      return `#${parentId}`;
    }
  }),

  /**
   * @type {ComputedProperty<String>}
   */
  clickOutsideExceptSelector: tag `${'parentSelector'}, ${'parentSelector'} *, .one-webui-popover-block-settings`,

  actions: {
    /**
     * @param {Function} closeSelectorCallback 
     * @param {Array<Utils.QueryBuilder.QueryBlock>} newBlocks
     */
    blockReplace(closeSelectorCallback, newBlocks) {
      closeSelectorCallback();
      this.get('onBlockReplace')(newBlocks);
    },

    close() {
      this.get('onSettingsClose')();
    },
  },
});
