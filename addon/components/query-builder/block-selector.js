/**
 * Contains options for query block. In 'create' mode allows to select new block, in 'edit'
 * mode has options for changing existing query blocks.
 * 
 * @module components/query-builder/block-selector
 * @author Michał Borzęcki, Jakub Liput
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import ConditionQueryBlock from 'onedata-gui-common/utils/query-builder/condition-query-block';
import AndOperatorQueryBlock from 'onedata-gui-common/utils/query-builder/and-operator-query-block';
import OrOperatorQueryBlock from 'onedata-gui-common/utils/query-builder/or-operator-query-block';
import ExcludingOperatorQueryBlock from 'onedata-gui-common/utils/query-builder/excluding-operator-query-block';
import NotOperatorQueryBlock from 'onedata-gui-common/utils/query-builder/not-operator-query-block';
import layout from 'onedata-gui-common/templates/components/query-builder/block-selector';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { tag } from 'ember-awesome-macros';
import { set, get, computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
import notImplementedThrow from 'onedata-gui-common/utils/not-implemented-throw';
import { reads } from '@ember/object/computed';

const allowedModes = ['create', 'edit'];

const operatorClasses = {
  and: AndOperatorQueryBlock,
  or: OrOperatorQueryBlock,
  excluding: ExcludingOperatorQueryBlock,
  not: NotOperatorQueryBlock,
};

const operatorsMaxOperandsNumber = Object.keys(operatorClasses)
  .reduce((obj, operatorName) => {
    obj[operatorName] = get(operatorClasses[operatorName].create(), 'maxOperandsNumber');
    return obj;
  }, {});

export default Component.extend(I18n, {
  layout,

  classNames: ['query-builder-block-selector'],
  classNameBindings: ['modeClass'],

  i18nPrefix: 'components.queryBuilder.blockSelector',

  /**
   * @virtual
   * @type {Array<Utils.QueryProperty>}
   */
  queryProperties: Object.freeze([]),

  /**
   * @type {Array<String>}
   */
  allowedModes,

  /**
   * Non-validated user-set value of mode.
   * See: `mode` computed property.
   * @type {String}
   */
  rawMode: null,

  mode: computed({
    get() {
      const {
        rawMode,
        allowedModes,
      } = this.getProperties('rawMode', 'allowedModes');
      return rawMode && allowedModes.include(rawMode) ? rawMode : allowedModes[0];
    },
    set(key, value) {
      return this.set('rawMode', value);
    },
  }),

  isEditBlockAnOperator: reads('editBlock.isOperator'),

  /**
   * @virtual
   * @type {Utils.QueryBuilder.QueryBlock}
   */
  editBlock: null,

  /**
   * @virtual
   * @type {Function}
   */
  onBlockAdd: notImplementedThrow,

  /**
   * @virtual
   * @param {Utils.QueryBuilder.QueryBlock} newBlock
   * @type {Function}
   */
  onBlockReplace: notImplementedThrow,

  modeClass: tag `${'mode'}-block-selector`,

  /**
   * @type {ComputedProperty<Array<String>>}
   */
  disabledOperatorsForChange: computed(
    'editBlock.{operator,operands.[]}',
    function disabledChangeSectionOperators() {
      const editBlock = this.get('editBlock');
      const operatorNames = Object.keys(operatorClasses);

      if (!editBlock) {
        return operatorNames;
      }

      const editBlockOperator = get(editBlock, 'operator');
      const editBlockOperandsCount = get(editBlock, 'operands.length');
      return operatorNames.filter((operatorName) => {
        return operatorName === editBlockOperator ||
          operatorsMaxOperandsNumber[operatorName] < editBlockOperandsCount;
      });
    }
  ),

  /**
   * @param {String} operatorName 
   * @param {Array<Utils.QueryBuilder.QueryBlock>} initialOperands
   * @returns {Utils.QueryBuilder.OperatorQueryBlock}
   */
  createOperatorBlock(operatorName, initialOperands) {
    const newBlock = operatorClasses[operatorName].create();
    if (!isEmpty(initialOperands)) {
      set(newBlock, 'operands', initialOperands);
    }
    return newBlock;
  },

  actions: {
    /**
     * @param {String} operatorName 
     */
    operatorAdded(operatorName) {
      this.get('onBlockAdd')(this.createOperatorBlock(operatorName));
    },

    /**
     * @param {Utils.QueryProperty} property 
     * @param {String} comparator 
     * @param {any} comparatorValue 
     */
    conditionAdded(property, comparator, comparatorValue) {
      const condition = ConditionQueryBlock.create({
        property,
        comparator,
        comparatorValue,
      });
      this.get('onBlockAdd')(condition);
    },

    /**
     * @param {String} operatorName 
     */
    surround(operatorName) {
      const {
        editBlock,
        onBlockReplace,
      } = this.getProperties('editBlock', 'onBlockReplace');
      if (editBlock) {
        onBlockReplace(this.createOperatorBlock(operatorName, [editBlock]));
      }
    },

    /**
     * @param {String} operatorName 
     */
    changeToOperator(operatorName) {
      const {
        editBlock,
        onBlockReplace,
      } = this.getProperties('editBlock', 'onBlockReplace');
      if (editBlock) {
        onBlockReplace(
          this.createOperatorBlock(operatorName, get(editBlock, 'operands'))
        );
      }
    },
  },
});
