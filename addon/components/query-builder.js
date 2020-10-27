/**
 * Shows query builder - blocks editor, query trigger and curl generator.
 *
 * @module components/query-builder
 * @author Michał Borzęcki, Jakub Liput
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed, get, set } from '@ember/object';
import RootOperatorQueryBlock from 'onedata-gui-common/utils/query-builder/root-operator-query-block';
import layout from 'onedata-gui-common/templates/components/query-builder';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  layout,

  classNames: ['query-builder'],

  /**
   * @type {String}
   */
  i18nPrefix: 'components.queryBuilder',

  /**
   * @virtual
   * // FIXME: description
   */
  sortProperty: undefined,

  /**
   * @virtual
   * FIXME: description
   */
  sortDirection: undefined,

  /**
   * @virtual
   * FIXME: description
   */
  queryChanged: undefined,

  /**
   * @virtual
   * @type {Function}
   * @param {Utils.QueryBuilder.RootOperatorQueryBlock} rootQueryBlock
   */
  onPerformQuery: undefined,

  /**
   * @virtual
   * FIXME: description
   */
  onGenerateCurl: undefined,

  /**
   * @virtual
   * FIXME: some transform function is needed to create them from qos-parameter-suggestions
   */
  queryProperties: undefined,

  /**
   * @type {Utils.QueryBuilder.RootOperatorQueryBlock}
   */
  rootQueryBlock: computed(() => RootOperatorQueryBlock.create()),

  /**
   * Contains state of the condition blocks edition.
   * Each state has only one field (for now):
   * - isValid: boolean.
   * Empty Map is set in init.
   * @type {Map<Utils.QueryBuilder.ConditionQueryBlock,Object>}
   */
  editedConditions: undefined,

  /**
   * @type {ComputedProperty<Boolean>}
   */
  hasInvalidCondition: computed('editedConditions', function hasInvalidCondition() {
    return [...this.get('editedConditions').values()].mapBy('isValid')
      .some(isValid => !isValid);
  }),

  init() {
    this._super(...arguments);
    this.set('editedConditions', new Map());
  },

  actions: {
    performQuery() {
      const {
        onPerformQuery,
        rootQueryBlock,
      } = this.getProperties('onPerformQuery', 'rootQueryBlock');
      onPerformQuery(rootQueryBlock);
    },
    /**
     * @param {Utils.QueryBuilder.ConditionQueryBlock} conditionBlock
     */
    onConditionEditionStart(conditionBlock) {
      this.get('editedConditions').set(conditionBlock, { isValid: true });
      this.notifyPropertyChange('editedConditions');
    },
    /**
     * @param {Utils.QueryBuilder.ConditionQueryBlock} conditionBlock
     */
    onConditionEditionEnd(conditionBlock) {
      this.get('editedConditions').delete(conditionBlock);
      this.notifyPropertyChange('editedConditions');
    },

    /**
     * @param {Utils.QueryBuilder.ConditionQueryBlock} conditionBlock
     *
     * @param {boolean} isValid
     */
    onConditionEditionValidityChange(conditionBlock, isValid) {
      const editedConditionEntry = this.get('editedConditions').get(conditionBlock);
      if (editedConditionEntry) {
        set(editedConditionEntry, 'isValid', isValid);
        this.notifyPropertyChange('editedConditions');
      }
    },

    /**
     * @param {Utils.QueryBuilder.QueryBlock} block
     */
    onBlockRemoved(block) {
      // building list of all conditions inside passed block (including block itself)
      const flattenedConditionsList = [];
      const blocksToFlatten = [block];
      while (blocksToFlatten.length) {
        const blockToFlatten = blocksToFlatten.pop();
        if (get(blockToFlatten, 'isOperator')) {
          blocksToFlatten.push(...get(blockToFlatten, 'operands'));
        } else {
          flattenedConditionsList.push(blockToFlatten);
        }
      }

      for (const condition of flattenedConditionsList) {
        this.get('editedConditions').delete(condition);
      }

      this.notifyPropertyChange('editedConditions');
    },
  },
});
