/**
 * Renders query builder - an input-looking container that renders block hierarchy.
 * To integrate query builder with outside world, inject your own `rootQueryBlock`
 * and see methods for reading edited query data.
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
import QueryValueComponentsBuilder from 'onedata-gui-common/utils/query-value-components-builder';

export default Component.extend(I18n, {
  layout,

  classNames: ['query-builder'],

  /**
   * @override
   * @type {String}
   */
  i18nPrefix: 'components.queryBuilder',

  /**
   * Objects should have at least these properties:
   * - key
   * - displayedKey
   * - type
   * 
   * Additional properties:
   * - isSpecialKey
   * 
   * @virtual
   * @type {Array<Object>}
   */
  queryProperties: undefined,

  /**
   * @virtual
   * @type {Utils.QueryComponentValueBuilder}
   */
  valuesBuilder: undefined,

  /**
   * Trigger parent of component to update `queryProperties` data.
   * @virtual
   * @type {Function}
   */
  refreshQueryProperties: notImplementedIgnore,

  /**
   * Set of operators available to add in blocks.
   * Eg. `['and', 'or', 'expect', 'not']`.
   * See: `component:query-builder/block-selector#validOperators` for available values.
   * @virtual
   * @type {Array<String>}
   */
  operators: undefined,

  /**
   * @virtual optional
   * @type {Boolean}
   */
  readonly: false,

  /**
   * @virtual optional
   * @type {Utils.QueryBuilder.RootOperatorQueryBlock}
   */
  rootQueryBlock: undefined,

  /**
   * Placement of all rendered one-webui-popover, see
   * `component:one-webui-popover#placement`.
   * @type {String}
   */
  popoverPlacement: 'vertical',

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
    if (!this.get('rootQueryBlock')) {
      this.set('rootQueryBlock', RootOperatorQueryBlock.create());
    }
    if (!this.get('valuesBuilder')) {
      this.set('valuesBuilder', QueryValueComponentsBuilder.create());
    }
  },

  actions: {
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
     * @param {Boolean} isValid
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

/**
 * @typedef QueryProperty
 * @property {String} key backend name of property
 * @property {String} displayedKey name of property displayed for user
 * @property {String} type one of: "string", "number", "stringOptions", "numberOptions",
 *   "mixedOptions"
 * @property {Array<String>} [stringValues] available string values to choose from
 * @property {Array<Number>} [numberValues] available number value to choose from
 * @property {Array<any>} [allValues] available string/number value to chooese from,
 *   if type is "mixedOptions"
 */
