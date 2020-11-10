/**
 * Provides controls to select condition parameters - property, comparator and
 * comparator value.
 * 
 * @module components/query-builder/block-selector/condition-selector
 * @author Michał Borzęcki, Jakub Liput
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import {
  defaultComparators,
  defaultComparatorEditors,
} from 'onedata-gui-common/utils/query-builder/condition-comparator-editors';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import layout from 'onedata-gui-common/templates/components/query-builder/block-selector/condition-selector';

export default Component.extend(I18n, {
  layout,

  classNames: ['condition-selector'],

  /**
   * @type {String}
   */
  i18nPrefix: 'components.queryBuilder.blockSelector.conditionSelector',

  /**
   * @virtual optional
   * @type {Array<QueryProperty>}
   */
  queryProperties: Object.freeze([]),

  /**
   * @type {Utils.QueryProperty}
   */
  selectedConditionProperty: undefined,

  /**
   * @type {String}
   */
  selectedConditionComparator: undefined,

  /**
   * One of: known, custom
   * @type {String}
   */
  comparatorMode: 'known',

  /**
   * @type {any}
   */
  conditionComparatorValue: undefined,

  /**
   * @type {Object}
   */
  comparatorsSet: defaultComparators,

  /**
   * @type {Object}
   */
  comparatorEditorsSet: defaultComparatorEditors,

  /**
   * @type {Function}
   * @param {Utils.QueryProperty} property
   * @param {String} comparator
   * @param {any} comparatorValue
   */
  onConditionSelected: notImplementedIgnore,

  conditionComparator: computed(
    'selectedConditionComparator',
    'comparatorMode',
    function conditionComparator() {
      const {
        comparatorMode,
        selectedConditionComparator,
      } = this.getProperties('comparatorMode', 'selectedConditionComparator');
      switch (comparatorMode) {
        case 'known':
          return selectedConditionComparator + 'Suggestion';
        case 'custom':
        default:
          return selectedConditionComparator;
      }
    }
  ),

  /**
   * @type {ComputedProperty<Array<String>>}
   */
  comparators: computed(
    'selectedConditionProperty.type',
    'comparatorsSet',
    function comparators() {
      const propertyType = this.get('selectedConditionProperty.type');
      return this.get('comparatorsSet')[propertyType] || [];
    }
  ),

  comparatorEditor: computed(
    'comparatorEditorsSet',
    'selectedConditionComparator',
    function comparatorEditor() {
      const {
        comparatorEditorsSet,
        selectedConditionComparator,
      } = this.getProperties('comparatorEditorsSet', 'selectedConditionComparator');
      return comparatorEditorsSet[selectedConditionComparator];
    }
  ),

  /**
   * @type {ComputedProperty<Boolean>}
   */
  isConditionComparatorValueValid: computed(
    'comparatorEditor',
    'conditionComparatorValue',
    function isConditionComparatorValueValid() {
      const {
        comparatorEditor,
        conditionComparatorValue,
      } = this.getProperties('comparatorEditor', 'conditionComparatorValue');
      return comparatorEditor ?
        comparatorEditor.isValidValue(conditionComparatorValue) : false;
    },
  ),

  /**
   * @type {ComputedProperty<Boolean>}
   */
  isConditionDataValid: computed(
    'selectedConditionProperty',
    'selectedConditionComparator',
    'isConditionComparatorValueValid',
    function isConditionDataValid() {
      const {
        selectedConditionProperty,
        selectedConditionComparator,
        isConditionComparatorValueValid,
      } = this.getProperties(
        'selectedConditionProperty',
        'selectedConditionComparator',
        'isConditionComparatorValueValid',
      );
      return selectedConditionProperty &&
        selectedConditionComparator &&
        isConditionComparatorValueValid;
    },
  ),

  conditionComparatorValueChanged(value) {
    this.set('conditionComparatorValue', value);
  },

  /**
   * @param {String} comparator 
   */
  conditionComparatorChanged(comparator) {
    this.set('selectedConditionComparator', comparator);

    // below properties update after change of seletedConditionComparator
    const {
      isConditionComparatorValueValid,
      comparatorEditor,
    } = this.getProperties(
      'isConditionComparatorValueValid',
      'comparatorEditor'
    );

    if (!isConditionComparatorValueValid) {
      this.conditionComparatorValueChanged(comparatorEditor.defaultValue());
    }
  },

  actions: {
    /**
     * @param {Utils.QueryProperty} queryProperty 
     */
    conditionPropertyChanged(queryProperty) {
      this.set('selectedConditionProperty', queryProperty);

      // below properties update after change of selectedConditionProperty
      const {
        comparators,
        selectedConditionComparator,
      } = this.getProperties('comparators', 'selectedConditionComparator');
      if (!comparators.includes(selectedConditionComparator)) {
        this.conditionComparatorChanged(comparators[0]);
      }
    },

    /**
     * @param {String} comparator 
     */
    conditionComparatorChanged(comparator) {
      return this.conditionComparatorChanged(comparator);
    },

    /**
     * @param {any} value 
     */
    conditionComparatorValueChanged(value) {
      this.conditionComparatorValueChanged(value);
    },

    conditionSelected() {
      const {
        onConditionSelected,
        selectedConditionProperty,
        selectedConditionComparator,
        conditionComparatorValue,
      } = this.getProperties(
        'onConditionSelected',
        'selectedConditionProperty',
        'selectedConditionComparator',
        'conditionComparatorValue',
      );
      onConditionSelected(
        selectedConditionProperty,
        selectedConditionComparator,
        conditionComparatorValue
      );
    },
  },
});
