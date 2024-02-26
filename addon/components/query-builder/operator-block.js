/**
 * Visualizes a single operator block.
 *
 * @author Michał Borzęcki, Jakub Liput
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import { computed, get } from '@ember/object';
import { reads } from '@ember/object/computed';
import layout from 'onedata-gui-common/templates/components/query-builder/operator-block';
import { tag } from 'ember-awesome-macros';
import I18n from 'onedata-gui-common/mixins/components/i18n';

const mixins = [
  I18n,
];

export default Component.extend(...mixins, {
  layout,
  classNames: ['query-builder-block', 'query-builder-operator-block'],
  classNameBindings: ['operatorBlockClass'],

  i18nPrefix: 'components.queryBuilder.operatorBlock',

  /**
   * @virtual
   * @type {Function}
   */
  refreshQueryProperties: notImplementedIgnore,

  /**
   * @virtual
   * @type {Function}
   * @param {Utils.QueryBuilder.QueryBlock} queryBlock
   */
  onBlockRemoved: notImplementedIgnore,

  /**
   * @virtual
   * @type {Function}
   */
  onConditionEditionStart: notImplementedIgnore,

  /**
   * @virtual
   * @type {Function}
   */
  onConditionEditionEnd: notImplementedIgnore,

  /**
   * @virtual
   * @type {Function}
   */
  onConditionEditionValidityChange: notImplementedIgnore,

  /**
   * @virtual
   * @type {Array<String>}
   */
  operators: undefined,

  /**
   * @virtual
   * @type {Utils.QueryComponentValueBuilder}
   */
  valuesBuilder: undefined,

  /**
   * @virtual
   * @type {Utils.QueryBuilder.OperatorQueryBlock}
   */
  queryBlock: undefined,

  /**
   * @virtual
   * @type {Array<QueryProperty>}
   */
  queryProperties: Object.freeze([]),

  /**
   * @type {String}
   */
  popoverPlacement: 'vertical',

  /**
   * If this is not a root, please inject the value.
   * Root of the tree has the highest level value. Children on the same level will have
   * level - 1.
   * Typically level should be passed from outside except for root, which have the level
   * set to known max depth of tree.
   * See `component:block-visualiser#level` docs.
   * @virtual optional
   * @type {Number}
   */
  level: computed('queryBlock.{operator,levelScore}', {
    get() {
      if (typeof this.injectedLevel === 'number') {
        return this.injectedLevel;
      }
      if (this.get('queryBlock.operator') === 'root') {
        return this.get('queryBlock.levelScore');
      }
    },
    set(key, value) {
      return this.injectedLevel = value;
    },
  }),

  /**
   * @type {number | string}
   */
  injectedLevel: null,

  /**
   * Class name based on operator type (eg. or-operator-block)
   * @type {ComputedProperty<String>}
   */
  operatorBlockClass: tag `${'queryBlock.operator'}-operator-block`,

  /**
   * First internal query block (if this block contains at least one operand)
   * @type {ComputedProperty<Utils.QueryBlock|undefined>}
   */
  firstOperand: reads('queryBlock.operands.firstObject'),

  /**
   * @type {ComputedProperty<Boolean>}
   */
  hasSingleOperandOperator: computed(
    'queryBlock.maxOperandsNumber',
    function hasSingleOperandOperator() {
      const queryBlock = this.get('queryBlock');
      return Boolean(queryBlock) && get(queryBlock, 'maxOperandsNumber') === 1;
    }
  ),

  replaceBlock(oldBlock, newBlocks) {
    const operands = this.get('queryBlock.operands');
    const oldBlockIndex = operands.indexOf(oldBlock);
    if (oldBlockIndex >= 0) {
      operands.replace(oldBlockIndex, 1, newBlocks);
    }
  },

  actions: {
    /**
     * @param {Utils.QueryBuilder.QueryBlock} newQueryBlock
     */
    addBlock(newQueryBlock) {
      const queryBlock = this.get('queryBlock');
      if (
        get(queryBlock, 'operator') === 'root' &&
        get(queryBlock, 'operands.length')
      ) {
        // When root block has an operand, then next operator additions should surround
        // existing operand. Adding next conditions to the root block is not allowed.
        if (get(newQueryBlock, 'isOperator')) {
          const firstOperand = this.get('firstOperand');
          newQueryBlock.addOperand(firstOperand);
          this.replaceBlock(firstOperand, [newQueryBlock]);
        }
      } else {
        queryBlock.addOperand(newQueryBlock);
      }
    },

    /**
     * @param {Utils.QueryBuilder.QueryBlock} oldBlock
     * @param {Array<Utils.QueryBuilder.QueryBlock>} newBlocks
     */
    replaceBlock(oldBlock, newBlocks) {
      this.replaceBlock(oldBlock, newBlocks);
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
