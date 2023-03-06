/**
 * Contains options for query block. In 'create' mode allows to select new block, in 'edit'
 * mode has options for changing existing query blocks.
 *
 * @author Michał Borzęcki, Jakub Liput
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import ConditionQueryBlock from 'onedata-gui-common/utils/query-builder/condition-query-block';
import AndOperatorQueryBlock from 'onedata-gui-common/utils/query-builder/and-operator-query-block';
import OrOperatorQueryBlock from 'onedata-gui-common/utils/query-builder/or-operator-query-block';
import ExceptOperatorQueryBlock from 'onedata-gui-common/utils/query-builder/except-operator-query-block';
import NotOperatorQueryBlock from 'onedata-gui-common/utils/query-builder/not-operator-query-block';
import layout from 'onedata-gui-common/templates/components/query-builder/block-selector';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { tag, array, raw, or, equal } from 'ember-awesome-macros';
import { set, get, computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
import notImplementedThrow from 'onedata-gui-common/utils/not-implemented-throw';
import { reads } from '@ember/object/computed';
import { A } from '@ember/array';

const operatorClasses = {
  and: AndOperatorQueryBlock,
  or: OrOperatorQueryBlock,
  except: ExceptOperatorQueryBlock,
  not: NotOperatorQueryBlock,
};

const operatorsMaxOperandsNumber = Object.keys(operatorClasses)
  .reduce((obj, operatorName) => {
    obj[operatorName] = get(operatorClasses[operatorName].create(), 'maxOperandsNumber');
    return obj;
  }, {});

const mixins = [
  I18n,
];

export default Component.extend(...mixins, {
  layout,

  classNames: ['query-builder-block-selector'],
  classNameBindings: ['modeClass', 'effHideConditionsCreation::with-conditions'],

  i18nPrefix: 'components.queryBuilder.blockSelector',

  /**
   * @virtual
   * @type {Array<QueryProperty>}
   */
  queryProperties: Object.freeze([]),

  /**
   * @virtual optional
   * @type {Boolean}
   */
  hideConditionCreation: false,

  /**
   * @virtual optional
   * @type {Utils.QueryBuilder.OperatorQueryBlock}
   */
  editParentBlock: null,

  /**
   * @virtual
   * @type {Utils.QueryComponentValueBuilder}
   */
  valuesBuilder: undefined,

  /**
   * If true, select buttons are disabled. It should be set if the popover is going
   * to be hidden to prevent multiple clicks.
   * @virtual
   * @type {Boolean}
   */
  selectionDone: undefined,

  /**
   * One of: "create", "edit"
   * @virtual optional
   * @type {String}
   */
  mode: 'create',

  /**
   * Condition creation should be hidden always in edit mode.
   * @type {ComputedProperty<Boolean>}
   */
  effHideConditionCreation: or(equal('mode', raw('edit')), 'hideConditionCreation'),

  /**
   * @type {ComputedProperty<Boolean>}
   */
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

  /**
   * @type {ComputedProperty<String>}
   */
  modeClass: tag `${'mode'}-block-selector`,

  /**
   * Add pseudo-operator "none" to available operators.
   * @type {ComputedProperty<Array<String>}
   */
  editOperators: array.concat('operators', raw(['none'])),

  /**
   * @type {ComputedProperty<Array<String>>}
   */
  disabledOperatorsForChange: computed(
    'editBlock.{operator,operands.[]}',
    'editParentBlock',
    function disabledChangeSectionOperators() {
      const {
        editBlock,
        editParentBlock,
      } = this.getProperties('editBlock', 'editParentBlock');
      const operatorNames = Object.keys(operatorClasses);

      if (!editBlock) {
        return [...operatorNames, 'none'];
      }

      const editBlockOperator = get(editBlock, 'operator');
      const editBlockOperandsCount = get(editBlock, 'operands.length');
      const disabledOperators = operatorNames.filter((operatorName) => {
        return operatorName === editBlockOperator ||
          operatorsMaxOperandsNumber[operatorName] < editBlockOperandsCount;
      });

      const parentBlockMaxOperands = editParentBlock &&
        get(editParentBlock, 'maxOperandsNumber');
      const parentBlockOperandsCount = editParentBlock &&
        get(editParentBlock, 'operands.length');
      if (
        !editParentBlock ||
        !(get(editBlock, 'isOperator')) ||
        parentBlockMaxOperands < (parentBlockOperandsCount - 1) + editBlockOperandsCount
      ) {
        disabledOperators.push('none');
      }

      return disabledOperators;
    }
  ),

  /**
   * @param {String} operatorName
   * @param {Array<Utils.QueryBuilder.QueryBlock>} initialOperands
   * @returns {Utils.QueryBuilder.OperatorQueryBlock}
   */
  createOperatorBlock(operatorName, initialOperands) {
    const blockProperties = {};
    if (!isEmpty(initialOperands)) {
      set(blockProperties, 'operands', initialOperands);
    }
    return operatorClasses[operatorName].create(blockProperties);
  },

  actions: {
    /**
     * @param {String} operatorName
     */
    operatorAdded(operatorName) {
      this.get('onBlockAdd')(this.createOperatorBlock(operatorName));
    },

    /**
     * @param {QueryProperty} property
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
        onBlockReplace([this.createOperatorBlock(operatorName, A([editBlock]))]);
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
        const operands = get(editBlock, 'operands');
        if (operatorName === 'none') {
          onBlockReplace(operands);
        } else {
          onBlockReplace([this.createOperatorBlock(operatorName, operands)]);
        }
      }
    },
  },
});
