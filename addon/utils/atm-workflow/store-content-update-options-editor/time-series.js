/**
 * Provides a form element capable of showing and modifying time
 * series store content update options. It also provides two methods
 * for conversion between form values and store content update options
 * in both directions.
 *
 * @module utils/atm-workflow/store-content-update-options-editor/time-series
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import _ from 'lodash';
import { computed, set, get, getProperties } from '@ember/object';
import { reads } from '@ember/object/computed';
import FormFieldsCollectionGroup from 'onedata-gui-common/utils/form-component/form-fields-collection-group';
import FormFieldsGroup from 'onedata-gui-common/utils/form-component/form-fields-group';
import DropdownField from 'onedata-gui-common/utils/form-component/dropdown-field';
import { translateNameMatcherType } from '../data-spec/time-series-measurements';
import { translateNameGeneratorType } from '../store-config/time-series';
import {
  prefixCombiners,
  translatePrefixCombiner,
} from '../store-content-update-options/time-series';
import { createValuesContainer } from 'onedata-gui-common/utils/form-component/values-container';

const formElement = FormFieldsCollectionGroup.extend({
  /**
   * @virtual
   * @type {AtmDataSpec}
   */
  contentUpdateDataSpec: undefined,

  /**
   * @virtual
   * @type {TimeSeriesStoreConfig}
   */
  storeConfig: undefined,

  /**
   * @override
   */
  classes: 'time-series-store-content-update-options-editor',

  /**
   * @override
   */
  i18nPrefix: 'utils.atmWorkflow.storeContentUpdateOptionsEditor.timeSeries.fields',

  /**
   * Does not take parent fields group translation path into account
   * @override
   */
  translationPath: '',

  /**
   * @type {ComputedProperty<Array<TimeSeriesMeasurementsSpec>>}
   */
  measurementSpecs: reads('contentUpdateDataSpec.valueConstraints.specs'),

  /**
   * @type {Array<TimeSeriesSchema>}
   */
  generatorSchemas: reads('storeConfig.schemas'),

  /**
   * @override
   */
  fieldFactoryMethod(uniqueFieldValueName) {
    return FormFieldsGroup.create({
      name: 'dispatchRule',
      valueName: uniqueFieldValueName,
      fields: [
        DropdownField.extend({
          options: computed('parent.parent.measurementSpecs.[]', function options() {
            const i18n = this.get('i18n');
            const measurementSpecs = this.get('parent.parent.measurementSpecs') || [];
            return measurementSpecs.map((measurementSpec) => ({
              value: `${measurementSpec.nameMatcherType}:${measurementSpec.nameMatcher}`,
              label: `${translateNameMatcherType(i18n, measurementSpec.nameMatcherType)} "${measurementSpec.nameMatcher}"`,
            }));
          }),
          defaultValue: reads('options.firstObject.value'),
        }).create({
          name: 'measurementNameMatcher',
        }),
        DropdownField.extend({
          options: computed('parent.parent.generatorSchemas.[]', function options() {
            const i18n = this.get('i18n');
            const generatorSchemas = this.get('parent.parent.generatorSchemas') || [];
            return generatorSchemas.map((generatorSchema) => ({
              value: generatorSchema.nameGenerator,
              label: `${translateNameGeneratorType(i18n, generatorSchema.nameGeneratorType)} "${generatorSchema.nameGenerator}"`,
            }));
          }),
          defaultValue: reads('options.firstObject.value'),
        }).create({
          name: 'timeSeriesNameGenerator',
        }),
        DropdownField.extend({
          options: computed(function options() {
            const i18n = this.get('i18n');
            return prefixCombiners.map((prefixCombiner) => ({
              value: prefixCombiner,
              label: translatePrefixCombiner(i18n, prefixCombiner),
            }));
          }),
          defaultValue: reads('options.firstObject.value'),
          isVisible: computed(
            'parent.parent.generatorSchemas.[]',
            'parent.value.{measurementNameMatcher,timeSeriesNameGenerator}',
            function isVisible() {
              const nameMatcherType =
                (this.get('parent.value.measurementNameMatcher') || '').split(':')[0];
              const nameGenerator = this.get('parent.value.timeSeriesNameGenerator');
              const timeSeriesGenerator = (this.get('parent.parent.generatorSchemas') || [])
                .findBy('nameGenerator', nameGenerator);
              const nameGeneratorType = timeSeriesGenerator ?
                timeSeriesGenerator.nameGeneratorType : null;
              return nameMatcherType === 'hasPrefix' && nameGeneratorType === 'addPrefix';
            }
          ),
        }).create({
          name: 'prefixCombiner',
        }),
      ],
    });
  },
});

/**
 * @param {Utils.FormComponent.ValuesContainer} values Values from time series
 * store content update options editor
 * @param { storeConfig: TimeSeriesStoreConfig } context
 * @returns {Object} store content update options
 */
function formValuesToStoreContentUpdateOptions(values, { storeConfig }) {
  const nameGeneratorToTypeMap = _.fromPairs(
    ((storeConfig || {}).schemas || [])
    .map(({ nameGeneratorType, nameGenerator }) => [nameGenerator, nameGeneratorType])
  );
  const dispatchRules = get(values, '__fieldsValueNames')
    .map((valueName) => get(values, valueName))
    .filter(Boolean)
    .map((dispatchRuleValue) => {
      const {
        measurementNameMatcher: formMeasurementNameMatcher,
        timeSeriesNameGenerator: formTimeSeriesNameGenerator,
        prefixCombiner: formPrefixCombiner,
      } = getProperties(
        dispatchRuleValue,
        'measurementNameMatcher',
        'timeSeriesNameGenerator',
        'prefixCombiner',
      );

      const typeSeparatorPosition = formMeasurementNameMatcher.indexOf(':');
      const measurementTimeSeriesNameMatcherType =
        formMeasurementNameMatcher.slice(0, typeSeparatorPosition);
      const measurementTimeSeriesNameMatcher =
        formMeasurementNameMatcher.slice(typeSeparatorPosition + 1);
      const dispatchRule = {
        measurementTimeSeriesNameMatcherType,
        measurementTimeSeriesNameMatcher,
        targetTimeSeriesNameGenerator: formTimeSeriesNameGenerator,
      };
      if (
        measurementTimeSeriesNameMatcherType === 'hasPrefix' &&
        nameGeneratorToTypeMap[formTimeSeriesNameGenerator] === 'addPrefix'
      ) {
        dispatchRule.prefixCombiner = formPrefixCombiner;
      }
      return dispatchRule;
    });

  return { dispatchRules };
}

/**
 * @param {Object} storeContentUpdateOptions
 * @returns {Utils.FormComponent.ValuesContainer} form values ready to use in a form
 */
function storeContentUpdateOptionsToFormValues(storeContentUpdateOptions) {
  const dispatchRuleFieldsValueNames = [];
  const values = createValuesContainer({
    __fieldsValueNames: dispatchRuleFieldsValueNames,
  });

  if (
    !storeContentUpdateOptions ||
    !Array.isArray(storeContentUpdateOptions.dispatchRules)
  ) {
    return values;
  }

  storeContentUpdateOptions.dispatchRules
    .filter(Boolean)
    .forEach((dispatchRule, idx) => {
      const dispatchRuleFormGroupName = `dispatchRule${idx}`;
      const dispatchRuleValue = {
        measurementNameMatcher: `${dispatchRule.measurementTimeSeriesNameMatcherType}:${dispatchRule.measurementTimeSeriesNameMatcher}`,
        timeSeriesNameGenerator: dispatchRule.targetTimeSeriesNameGenerator,
        prefixCombiner: dispatchRule.prefixCombiner,
      };

      set(values, dispatchRuleFormGroupName, createValuesContainer(dispatchRuleValue));
      dispatchRuleFieldsValueNames.push(dispatchRuleFormGroupName);
    });

  return values;
}

export default {
  formElement,
  formValuesToStoreContentUpdateOptions,
  storeContentUpdateOptionsToFormValues,
};
