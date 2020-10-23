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
import { defaultComparatorEditors } from 'onedata-gui-common/utils/query-builder/condition-comparator-editors';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import layout from 'onedata-gui-common/templates/components/query-builder/condition-block';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  layout,

  classNames: ['query-builder-block', 'query-builder-condition-block'],

  i18nPrefix: 'components.queryBuilder.conditionBlock',

  mode: 'view',

  editComparatorValue: null,

  comparatorEditorsSet: defaultComparatorEditors,

  /**
   * @type {Utils.QueryBuilder.ConditionQueryBlock}
   */
  queryBlock: Object.freeze({}),

  /**
   * @param {Utils.QueryBuilder.ConditionQueryBlock} queryBlock
   */
  onConditionEditionStart: notImplementedIgnore,

  /**
   * @param {Utils.QueryBuilder.ConditionQueryBlock} queryBlock
   */
  onConditionEditionEnd: notImplementedIgnore,

  /**
   * @param {Utils.QueryBuilder.ConditionQueryBlock} queryBlock
   * @param {boolean} isValid
   */
  onConditionEditionValidityChange: notImplementedIgnore,

  comparatorEditor: computed(
    'comparatorEditorsSet',
    'queryBlock.comparator',
    function comparatorEditor() {
      return this.get('comparatorEditorsSet')[this.get('queryBlock.comparator')];
    }
  ),

  /**
   * @type {ComputedProperty<Boolean>}
   */
  isEditComparatorValueValid: computed(
    'comparatorEditor',
    'editComparatorValue',
    function isEditComparatorValueValid() {
      const {
        comparatorEditor,
        editComparatorValue,
      } = this.getProperties('comparatorEditor', 'editComparatorValue');
      return comparatorEditor ?
        comparatorEditor.isValidValue(editComparatorValue) : false;
    }
  ),

  actions: {
    startEdit() {
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
      if (!this.get('isEditComparatorValueValid')) {
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
