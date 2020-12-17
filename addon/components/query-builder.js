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
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import { tag } from 'ember-awesome-macros';

export default Component.extend(I18n, {
  layout,

  classNames: ['query-builder'],
  classNameBindings: ['modeClass'],

  /**
   * @type {String}
   */
  i18nPrefix: 'components.queryBuilder',

  /**
   * @virtual
   */
  sortProperty: undefined,

  /**
   * @virtual
   */
  sortDirection: undefined,

  /**
   * @virtual
   */
  queryChanged: undefined,

  /**
   * @virtual
   */
  onGenerateCurl: undefined,

  /**
   * @virtual
   */
  queryProperties: undefined,

  /**
   * @virtual
   * @type {OnedataGuiCommon.Utils.QueryComponentValueBuilder}
   */
  valuesBuilder: undefined,

  /**
   * @virtual
   * @type {Function}
   */
  refreshQueryProperties: notImplementedIgnore,

  /**
   * Placement of all rendered one-webui-popover, see
   * `component:one-webui-popover#placement`.
   * @type {String}
   */
  popoverPlacement: 'vertical',

  /**
   * @type {Boolean}
   */
  readonly: false,

  /**
   * Contains state of the condition blocks edition.
   * Each state has only one field (for now):
   * - isValid: boolean.
   * Empty Map is set in init.
   * @type {Map<Utils.QueryBuilder.ConditionQueryBlock,Object>}
   */
  editedConditions: undefined,

  /**
   * @type {Utils.QueryBuilder.RootOperatorQueryBlock}
   */
  rootQueryBlock: computed(() => RootOperatorQueryBlock.create()),

  /**
   * @type {ComputedProperty<Boolean>}
   */
  hasInvalidCondition: computed('editedConditions', function hasInvalidCondition() {
    return [...this.get('editedConditions').values()].mapBy('isValid')
      .some(isValid => !isValid);
  }),

  modeClass: tag `query-builder-mode-${'inputMode'}`,

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

    refreshQueryProperties() {
      return this.get('refreshQueryProperties')();
    },
  },
});
