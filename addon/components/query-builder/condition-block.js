/**
 * Shows and allows to edit query conditon.
 * 
 * @module components/query-builder/condition-block
 * @author Michał Borzęcki, Jakub Liput
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import layout from 'onedata-gui-common/templates/components/query-builder/condition-block';
import I18n from 'onedata-gui-common/mixins/components/i18n';

const mixins = [
  I18n,
];

export default Component.extend(...mixins, {
  layout,

  classNames: ['query-builder-block', 'query-builder-condition-block'],
  classNameBindings: ['readonly'],

  i18nPrefix: 'components.queryBuilder.conditionBlock',

  /**
   * @virtual
   * @type {Array<Object>}
   */
  queryProperties: undefined,

  /**
   * @virtual
   * @type {Utils.QueryBuilder.ConditionQueryBlock}
   */
  queryBlock: Object.freeze({}),

  /**
   * @virtual
   * @type {Number}
   */
  level: undefined,

  /**
   * @virtual
   * @type {OnedataGuiCommon.Utils.QueryComponentValueBuilder}
   */
  valuesBuilder: undefined,

  /**
   * @virtual
   * @param {Utils.QueryBuilder.ConditionQueryBlock} queryBlock
   */
  onConditionEditionStart: notImplementedIgnore,

  /**
   * @virtual
   * @param {Utils.QueryBuilder.ConditionQueryBlock} queryBlock
   */
  onConditionEditionEnd: notImplementedIgnore,

  /**
   * @virtual
   * @param {Utils.QueryBuilder.ConditionQueryBlock} queryBlock
   * @param {boolean} isValid
   */
  onConditionEditionValidityChange: notImplementedIgnore,

  /**
   * @virtual
   * @type {Function}
   */
  onBlockRemoved: notImplementedIgnore,

  /**
   * @virtual
   * @type {Function}
   */
  refreshQueryProperties: notImplementedIgnore,

  mode: 'view',

  editComparatorValue: null,

  comparator: reads('queryBlock.comparator'),

  displayedKey: computed(
    'queryBlock.property.{key,displayKey,isSpecialKey}',
    function displayedKey() {
      const key = this.get('queryBlock.property.key');
      switch (key) {
        case 'spaceId':
          return 'space';
        case 'storageId':
          return 'storage';
        case 'anyStorage':
          return 'any storage';
        default:
          return key;
      }
    },
  ),

  queryProperty: computed(
    'queryProperties.[]',
    'queryBlock.property.key',
    function queryProperty() {
      const queryProperties = this.get('queryProperties');
      if (queryProperties) {
        return queryProperties.findBy('key', this.get('queryBlock.property.key'));
      }
    }
  ),

  /**
   * @type {ComputedProperty<Boolean>}
   */
  isEditComparatorValueValid: computed(
    'comparatorValidator',
    'editComparatorValue',
    function isEditComparatorValueValid() {
      const {
        comparatorValidator,
        editComparatorValue,
      } = this.getProperties('comparatorValidator', 'editComparatorValue');
      return comparatorValidator ? comparatorValidator(editComparatorValue) : false;
    }
  ),

  /**
   * @type {ComputedProperty<(value: any) => boolean>}
   */
  comparatorValidator: computed(
    'comparator',
    'valuesBuilder',
    function comparatorValidator() {
      const {
        comparator,
        valuesBuilder,
      } = this.getProperties('comparator', 'valuesBuilder');
      return valuesBuilder.getValidatorFor(comparator);
    }
  ),

  actions: {
    startEdit() {
      if (this.get('readonly')) {
        return;
      }

      this.setProperties({
        mode: 'edit',
        editComparatorValue: this.get('queryBlock.comparatorValue'),
      });
      const {
        queryBlock,
        onConditionEditionStart,
      } = this.getProperties('queryBlock', 'onConditionEditionStart');
      onConditionEditionStart(queryBlock);
    },

    /*
     * @param {any} newValue 
     */
    comparatorValueChange(newValue) {
      this.set('editComparatorValue', newValue);
      const {
        onConditionEditionValidityChange,
        queryBlock,
        isEditComparatorValueValid,
      } = this.getProperties(
        'onConditionEditionValidityChange',
        'queryBlock',
        'isEditComparatorValueValid'
      );
      onConditionEditionValidityChange(
        queryBlock,
        isEditComparatorValueValid
      );
    },

    finishEdit() {
      if (!this.get('isEditComparatorValueValid' || this.get('mode') === 'view')) {
        return;
      }
      this.set('mode', 'view');
      this.set('queryBlock.comparatorValue', this.get('editComparatorValue'));
      const {
        onConditionEditionEnd,
        queryBlock,
      } = this.getProperties('onConditionEditionEnd', 'queryBlock');
      onConditionEditionEnd(queryBlock);
    },

    cancelEdit() {
      this.set('mode', 'view');
      const {
        onConditionEditionEnd,
        queryBlock,
      } = this.getProperties('onConditionEditionEnd', 'queryBlock');
      onConditionEditionEnd(queryBlock);
    },
  },
});
