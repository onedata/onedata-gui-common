/**
 * Shows query block adder with adder trigger.
 * 
 * @module components/query-builder/block-adder
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import layout from 'onedata-gui-common/templates/components/query-builder/block-adder';
import { guidFor } from '@ember/object/internals';
import { tag } from 'ember-awesome-macros';
import { computed } from '@ember/object';

export default Component.extend({
  tagName: '',
  layout,

  classNames: ['query-builder-block-adder'],

  /**
   * @virtual
   * @type {Array<String>}
   */
  operators: undefined,

  /**
   * @virtual
   * @type {Function}
   */
  onBlockAdd: notImplementedIgnore,

  /**
   * @virtual optional
   * @type {Boolean}
   */
  disabled: false,

  /**
   * @virtual optional
   * @type {Boolean}
   */
  hideConditionCreation: false,

  btnId: tag `btn-${'componentId'}`,

  componentId: computed(function componentId() {
    return guidFor(this);
  }),

  actions: {
    /**
     * 
     * @param {Function} closeSelectorCallback
     * @param {Utils.QueryBuilder.QueryBlock} selectedBlock
     */
    addBlock(closeSelectorCallback, selectedBlock) {
      closeSelectorCallback();
      this.get('onBlockAdd')(selectedBlock);
    },
    togglePopover(open) {
      this.set('popoverOpen', open);
    },
  },
});
