/**
 * Visualizes a single operator block.
 * 
 * @module components/query-builder/operator-block
 * @author Michał Borzęcki, Jakub Liput
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { notImplementedIgnore } from 'onedata-gui-common/utils/not-implemented-ignore';
import { computed, get } from '@ember/object';
import { reads } from '@ember/object/computed';
import layout from 'onedata-gui-common/templates/components/query-builder/operator-block';
import { tag } from 'ember-awesome-macros';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  layout,
  classNames: ['query-builder-block', 'query-builder-operator-block'],
  classNameBindings: ['operatorBlockClass'],

  i18nPrefix: 'components.queryBuilder.operatorBlock',

  /**
   * @type {Utils.QueryBuilder.OperatorQueryBlock}
   */
  queryBlock: undefined,

  /**
   * @virtual
   * @type {Function}
   * @param {Utils.QueryBuilder.QueryBlock} queryBlock
   */
  onBlockRemoved: notImplementedIgnore,

  onConditionEditionStart: notImplementedIgnore,

  onConditionEditionEnd: notImplementedIgnore,

  onConditionEditionValidityChange: notImplementedIgnore,

  operatorBlockClass: tag `${'queryBlock.operator'}-operator-block`,

  /**
   * @virtual
   * @type {Array<Utils.QueryProperty>}
   */
  queryProperties: Object.freeze([]),

  firstOperand: reads('queryBlock.operands.firstObject'),

  hasSingleOperandOperator: computed(
    'queryBlock.maxOperandsNumber',
    function hasSingleOperandOperator() {
      const queryBlock = this.get('queryBlock');
      return queryBlock && get(queryBlock, 'maxOperandsNumber') === 1;
    }
  ),

  actions: {
    /**
     * @param {Utils.QueryBuilder.QueryBlock} queryBlock 
     */
    addBlock(queryBlock) {
      this.get('queryBlock.operands').pushObject(queryBlock);
    },

    /**
     * @param {Utils.QueryBuilder.QueryBlock} oldBlock
     * @param {Utils.QueryBuilder.QueryBlock} newBlock
     */
    replaceBlock(oldBlock, newBlock) {
      const operands = this.get('queryBlock.operands');
      const oldBlockIndex = operands.indexOf(oldBlock);
      if (oldBlockIndex >= 0) {
        operands.replace(oldBlockIndex, 1, [newBlock]);
      }
    },

    /**
     * @param {Utils.QueryBuilder.QueryBlock} queryBlock 
     */
    removeBlock(queryBlock) {
      this.get('queryBlock.operands').removeObject(queryBlock);
      this.get('onBlockRemoved')(queryBlock);
    },
  },
});
