/**
 * Provides a form element capable of showing and modifying time
 * series store content update options. It also provides two methods
 * for conversion between form values and store content update options
 * in both directions.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import _ from 'lodash';
import {
  computed,
  observer,
  set,
  get,
  getProperties,
} from '@ember/object';
import { reads } from '@ember/object/computed';
import FormFieldsCollectionGroup from 'onedata-gui-common/utils/form-component/form-fields-collection-group';
import FormFieldsGroup from 'onedata-gui-common/utils/form-component/form-fields-group';
import DropdownField from 'onedata-gui-common/utils/form-component/dropdown-field';
import { translateNameMatcherType } from '../data-spec/types/time-series-measurement';
import { translateTimeSeriesNameGeneratorType } from 'onedata-gui-common/utils/time-series';
import {
  prefixCombiners,
  translatePrefixCombiner,
} from '../store-content-update-options/time-series';
import { createValuesContainer } from 'onedata-gui-common/utils/form-component/values-container';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import { scheduleOnce } from '@ember/runloop';

const FormElement = FormFieldsCollectionGroup.extend({
  /**
   * @virtual
   * @type {AtmDataSpec}
   */
  contentUpdateDataSpec: undefined,

  /**
   * @virtual
   * @type {AtmTimeSeriesStoreConfig}
   */
  storeConfig: undefined,

  /**
   * @override
   */
  classes: 'time-series-store-content-update-options-editor boxes-collection-layout',

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
   * @override
   */
  sizeForChildren: 'sm',

  /**
   * @type {ComputedProperty<Array<AtmTimeSeriesMeasurementSpec>>}
   */
  measurementSpecs: computed('contentUpdateDataSpec', function measurementSpecs() {
    const isArray = this.get('contentUpdateDataSpec.type') === 'array';
    return this.get(isArray ?
      'contentUpdateDataSpec.itemDataSpec.specs' :
      'contentUpdateDataSpec.specs'
    );
  }),

  /**
   * @type {Array<AtmTimeSeriesSchema>}
   */
  generatorSchemas: reads('storeConfig.timeSeriesCollectionSchema.timeSeriesSchemas'),

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
              value: serializeNameMatcherValue(
                measurementSpec.nameMatcherType,
                measurementSpec.nameMatcher
              ),
              label: `${translateNameMatcherType(i18n, measurementSpec.nameMatcherType)} "${measurementSpec.nameMatcher}"`,
            }));
          }),
          defaultValue: reads('options.firstObject.value'),
          optionsObserver: observer('options.[]', function optionsObserver() {
            scheduleOnce('afterRender', this, 'adjustValueForNewOptions');
          }),
          init() {
            this._super(...arguments);
            this.optionsObserver();
          },
          adjustValueForNewOptions() {
            safeExec(this, () => {
              if (
                !this.value ||
                !this.options.find(({ value }) => value === this.value)
              ) {
                this.valueChanged(this.options[0]?.value);
              }
            });
          },
        }).create({
          name: 'measurementNameMatcher',
        }),
        DropdownField.extend({
          options: computed('parent.parent.generatorSchemas.[]', function options() {
            const i18n = this.get('i18n');
            const generatorSchemas = this.get('parent.parent.generatorSchemas') || [];
            return generatorSchemas.map((generatorSchema) => ({
              value: generatorSchema.nameGenerator,
              label: `${translateTimeSeriesNameGeneratorType(i18n, generatorSchema.nameGeneratorType)} "${generatorSchema.nameGenerator}"`,
            }));
          }),
          defaultValue: reads('options.firstObject.value'),
          optionsObserver: observer('options.[]', function optionsObserver() {
            scheduleOnce('afterRender', this, 'adjustValueForNewOptions');
          }),
          init() {
            this._super(...arguments);
            this.optionsObserver();
          },
          adjustValueForNewOptions() {
            safeExec(this, () => {
              if (
                !this.value ||
                !this.options.find(({ value }) => value === this.value)
              ) {
                this.valueChanged(this.options[0]?.value);
              }
            });
          },
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
          isVisible: computed(
            'parent.parent.generatorSchemas.[]',
            'parent.value.{measurementNameMatcher,timeSeriesNameGenerator}',
            function isVisible() {
              const nameMatcherType = deserializeNameMatcherValue(
                this.get('parent.value.measurementNameMatcher')
              )?.nameMatcherType;
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
          defaultValue: 'overwrite',
        }),
      ],
    });
  },
});

/**
 * @param {Utils.FormComponent.ValuesContainer} values Values from time series
 * store content update options editor
 * @param { storeConfig: AtmTimeSeriesStoreConfig } context
 * @returns {Object} store content update options
 */
function formValuesToStoreContentUpdateOptions(values, { storeConfig }) {
  const nameGeneratorToTypeMap = _.fromPairs(
    (storeConfig?.timeSeriesCollectionSchema?.timeSeriesSchemas ?? [])
    .map(({ nameGeneratorType, nameGenerator }) => [nameGenerator, nameGeneratorType])
  );
  const dispatchRules = get(values, '__fieldsValueNames')
    .map((valueName) => get(values, valueName))
    .filter((dispatchRuleValue) =>
      dispatchRuleValue && dispatchRuleValue.measurementNameMatcher
    )
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

      const deserializedNameMatcher =
        deserializeNameMatcherValue(formMeasurementNameMatcher);
      const dispatchRule = {
        measurementTimeSeriesNameMatcherType: deserializedNameMatcher.nameMatcherType,
        measurementTimeSeriesNameMatcher: deserializedNameMatcher.nameMatcher,
        targetTimeSeriesNameGenerator: formTimeSeriesNameGenerator,
      };
      if (
        deserializedNameMatcher.nameMatcherType === 'hasPrefix' &&
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
        measurementNameMatcher: serializeNameMatcherValue(
          dispatchRule.measurementTimeSeriesNameMatcherType,
          dispatchRule.measurementTimeSeriesNameMatcher
        ),
        timeSeriesNameGenerator: dispatchRule.targetTimeSeriesNameGenerator,
        prefixCombiner: dispatchRule.prefixCombiner,
      };

      set(values, dispatchRuleFormGroupName, createValuesContainer(dispatchRuleValue));
      dispatchRuleFieldsValueNames.push(dispatchRuleFormGroupName);
    });

  return values;
}

export default {
  FormElement,
  formValuesToStoreContentUpdateOptions,
  storeContentUpdateOptionsToFormValues,
};

function serializeNameMatcherValue(nameMatcherType, nameMatcher) {
  return `${nameMatcherType}|${nameMatcher}`;
}

function deserializeNameMatcherValue(nameMatcherValue) {
  if (!nameMatcherValue) {
    return null;
  }
  // Not using `split()` because second part of value (nameMatcher) can contain characters
  // the same as used separator.
  const typeSeparatorPosition = nameMatcherValue.indexOf('|');
  return {
    nameMatcherType: nameMatcherValue.slice(0, typeSeparatorPosition),
    nameMatcher: nameMatcherValue.slice(typeSeparatorPosition + 1),
  };
}
