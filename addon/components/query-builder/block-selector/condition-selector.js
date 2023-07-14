/**
 * Provides controls to select condition parameters - property, comparator and
 * comparator value.
 *
 * @author Michał Borzęcki, Jakub Liput
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import layout from 'onedata-gui-common/templates/components/query-builder/block-selector/condition-selector';
import { and, or, not } from 'ember-awesome-macros';
import sortByProperties from 'onedata-gui-common/utils/ember/sort-by-properties';

const mixins = [
  I18n,
];

export default Component.extend(...mixins, {
  layout,

  classNames: ['condition-selector'],

  /**
   * @override
   * @type {String}
   */
  i18nPrefix: 'components.queryBuilder.blockSelector.conditionSelector',

  /**
   * @virtual
   * @type {Array<QueryProperty>}
   */
  queryProperties: Object.freeze([]),

  /**
   * @virtual
   * @type {Utils.QueryComponentValueBuilder}
   */
  valuesBuilder: undefined,

  /**
   * @virtual
   * @type {Function}
   * @param {QueryProperty} property
   * @param {String} comparator
   * @param {any} comparatorValue
   */
  onConditionSelected: notImplementedIgnore,

  /**
   * @type {QueryProperty}
   */
  selectedConditionProperty: undefined,

  /**
   * @type {String}
   */
  selectedConditionComparator: undefined,

  /**
   * @type {any}
   */
  conditionComparatorValue: undefined,

  /**
   * Query properties sorted for display in power select
   * @type {ComputedProperty<Array<QueryProperty>>}
   */
  queryPropertiesForSelector: computed(
    'queryProperties.[]',
    function queryPropertiesForSelector() {
      const queryProperties = this.get('queryProperties');
      if (queryProperties) {
        return sortByProperties(queryProperties, ['isSpecialKey:desc', 'displayedKey']);
      } else {
        return [];
      }
    },
  ),

  /**
   * @type {ComputedProperty<Array<String>>}
   */
  comparators: computed(
    'selectedConditionProperty.type',
    'valuesBuilder',
    function comparators() {
      const propertyType = this.get('selectedConditionProperty.type');
      const valuesBuilder = this.get('valuesBuilder');
      return valuesBuilder.getComparatorsFor(propertyType);
    }
  ),

  /**
   * @type {ComputedProperty<(value: any) => boolean>}
   */
  comparatorValidator: computed(
    'selectedConditionComparator',
    'valuesBuilder',
    function comparatorValidator() {
      const {
        selectedConditionComparator,
        valuesBuilder,
      } = this.getProperties('selectedConditionComparator', 'valuesBuilder');
      return valuesBuilder.getValidatorFor(selectedConditionComparator);
    }
  ),

  /**
   * @type {ComputedProperty<any>}
   */
  comparatorDefaultValue: computed('selectedConditionProperty.type', 'valuesBuilder',
    function comparatorDefaultValue() {
      const propertyType = this.get('selectedConditionProperty.type');
      const valuesBuilder = this.get('valuesBuilder');
      return valuesBuilder.getDefaultValueFor(propertyType);
    }),

  /**
   * @type {ComputedProperty<Boolean>}
   */
  isConditionComparatorValueValid: computed(
    'comparatorValidator',
    'conditionComparatorValue',
    function isConditionComparatorValueValid() {
      const {
        comparatorValidator,
        conditionComparatorValue,
      } = this.getProperties('comparatorValidator', 'conditionComparatorValue');
      return comparatorValidator ? comparatorValidator(conditionComparatorValue) : false;
    },
  ),

  /**
   * @type {ComputedProperty<Boolean>}
   */
  isConditionDataValid: and(
    'selectedConditionProperty',
    or(
      // support for comparator-less conditions
      not('comparators.length'),
      and(
        'selectedConditionComparator',
        'isConditionComparatorValueValid',
      )
    ),
  ),

  conditionComparatorValueChanged(value) {
    this.set('conditionComparatorValue', value);
  },

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
    // reset value
    this.conditionComparatorValueChanged(undefined);
  },

  /**
   * @param {String} comparator
   */
  conditionComparatorChanged(comparator) {
    this.set('selectedConditionComparator', comparator);

    // below properties update after change of seletedConditionComparator
    const {
      isConditionComparatorValueValid,
      comparatorDefaultValue,
    } = this.getProperties(
      'isConditionComparatorValueValid',
      'comparatorDefaultValue'
    );

    if (isConditionComparatorValueValid) {
      this.conditionComparatorValueChanged(comparatorDefaultValue);
    }
  },

  actions: {
    /**
     * @param {QueryProperty} queryProperty
     */
    conditionPropertyChanged(queryProperty) {
      this.conditionPropertyChanged(queryProperty);
    },

    /**
     * @param {String} comparator
     */
    conditionComparatorChanged(comparator) {
      this.conditionComparatorChanged(comparator);
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
