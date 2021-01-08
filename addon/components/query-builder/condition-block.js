/**
 * Shows and allows to edit query conditon.
 * 
 * @module components/query-builder/condition-block
 * @author Michał Borzęcki, Jakub Liput
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed, get } from '@ember/object';
import { reads } from '@ember/object/computed';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import layout from 'onedata-gui-common/templates/components/query-builder/condition-block';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { or } from 'ember-awesome-macros';

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
   * @type {Array<QueryProperty>}
   */
  queryProperties: undefined,

  /**
   * @virtual
   * @type {Utils.QueryBuilder.ConditionQueryBlock}
   */
  queryBlock: Object.freeze({}),

  /**
   * @virtual
   * @type {Utils.QueryComponentValueBuilder}
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

  /**
   * Mode for condition-comparator-value-editor, see its mode property for more.
   * @type {String}
   */
  mode: 'view',

  /**
   * Current value of editor, eg. input's value
   * @type {String}
   */
  editComparatorValue: null,

  /**
   * @type {ComputedProperty<String>}
   */
  comparator: reads('queryBlock.comparator'),

  /**
   * @type {ComputedProperty<String>}
   */
  displayedKey: or('queryBlock.property.displayedKey', 'queryBlock.property.key'),

  /**
   * Find model of query property basing on key.
   * Enables updates of query properties data instead of relying on on-create version
   * of queryBlock.property.
   * @type {ComputedProperty<QueryProperty>}
   */
  queryProperty: computed(
    'queryProperties.[]',
    'queryBlock.property.key',
    function queryProperty() {
      const queryProperties = this.get('queryProperties');
      const property = this.get('queryBlock.property');
      return queryProperties && property &&
        queryProperties.findBy('key', get(property, 'key')) || property;
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
      const {
        mode,
        isEditComparatorValueValid,
        editComparatorValue,
        onConditionEditionEnd,
        queryBlock,
      } = this.getProperties(
        'mode',
        'isEditComparatorValueValid',
        'editComparatorValue',
        'onConditionEditionEnd',
        'queryBlock'
      );
      if (!isEditComparatorValueValid || mode === 'view') {
        return;
      }
      this.set('mode', 'view');
      this.set('queryBlock.comparatorValue', editComparatorValue);
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
