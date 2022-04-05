/**
 * Provides a form element capable of showing and modifying time
 * series store config. It also provides two methods
 * for conversion between form values and store config in both directions.
 *
 * @module utils/atm-workflow/store-config-editor/time-series
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { set, get, getProperties, computed, observer, defineProperty } from '@ember/object';
import { eq, raw } from 'ember-awesome-macros';
import { validator } from 'ember-cp-validations';
import FormFieldsGroup from 'onedata-gui-common/utils/form-component/form-fields-group';
import FormFieldsCollectionGroup from 'onedata-gui-common/utils/form-component/form-fields-collection-group';
import TextField from 'onedata-gui-common/utils/form-component/text-field';
import DropdownField from 'onedata-gui-common/utils/form-component/dropdown-field';
import TagsField from 'onedata-gui-common/utils/form-component/tags-field';
import {
  customUnit,
  customUnitsPrefix,
  units,
  translateUnit,
} from 'onedata-gui-common/utils/atm-workflow/data-spec/time-series-measurements';
import {
  nameGeneratorTypes,
  metricAggregators,
  translateNameGeneratorType,
} from 'onedata-gui-common/utils/atm-workflow/store-config/time-series';
import { createValuesContainer } from 'onedata-gui-common/utils/form-component/values-container';
import { Tag as MetricTag } from 'onedata-gui-common/components/tags-input/time-series-metric-selector-editor';

const formElement = FormFieldsCollectionGroup.extend({
  classes: 'time-series-store-config-editor',
  i18nPrefix: 'utils.atmWorkflow.storeConfigEditor.timeSeries.fields',
  // Does not take parent fields group translation path into account
  translationPath: '',
  usedNameGeneratorsSetter: observer(
    'value.__fieldsValueNames',
    function usedNameGeneratorsSetter() {
      const namePropsPaths = (this.get('value.__fieldsValueNames') || [])
        .map(entryValueName => `value.${entryValueName}.nameGenerator`);
      defineProperty(
        this,
        'usedNameGenerators',
        computed(...namePropsPaths, function usedNameGenerators() {
          return namePropsPaths.map((propPath) => this.get(propPath))
            .map((name) => (name || '').trim()).filter(Boolean);
        })
      );

      // Fixes scenario:
      // 1. Form is rendered with single time series generator.
      // 2. User focuses name generator.
      // 3. User creates new time series and enters only one letter into name generator
      // that introduces conflict.
      // Without `notifyPropertyChange` first name generator is still valid.
      this.notifyPropertyChange('usedNameGenerators');
    }
  ),
  init() {
    this._super(...arguments);
    this.usedNameGeneratorsSetter();
  },
  fieldFactoryMethod(uniqueFieldValueName) {
    const newField = FormFieldsGroup.create({
      name: 'timeSeriesSchema',
      valueName: uniqueFieldValueName,
      fields: [
        DropdownField.extend({
          options: computed(function options() {
            const i18n = this.get('i18n');
            return nameGeneratorTypes.map((nameGeneratorType) => ({
              value: nameGeneratorType,
              label: translateNameGeneratorType(i18n, nameGeneratorType),
            }));
          }),
        }).create({
          name: 'nameGeneratorType',
          defaultValue: nameGeneratorTypes[0],
        }),
        TextField.create({
          name: 'nameGenerator',
          customValidators: [
            validator(function (value, options, model) {
              const trimmedValue = (value || '').trim();
              if (!trimmedValue) {
                return true;
              }
              const field = get(model, 'field');
              const errorMsg = String(field.getTranslation('errors.notUnique'));
              const usedNameGenerators = get(model, 'field.parent.parent.usedNameGenerators');
              return usedNameGenerators
                .map((usedNameGenerator) => usedNameGenerator.trim())
                .filter((usedNameGenerator) =>
                  usedNameGenerator.startsWith(trimmedValue) ||
                  trimmedValue.startsWith(usedNameGenerator)
                ).length <= 1 ? true : errorMsg;
            }, {
              dependentKeys: ['model.field.parent.parent.usedNameGenerators'],
            }),
          ],
        }),
        DropdownField.extend({
          options: computed(function options() {
            const i18n = this.get('i18n');
            return units.map((unit) => ({
              value: unit,
              label: translateUnit(i18n, unit),
            }));
          }),
        }).create({
          name: 'unit',
          defaultValue: units[0],
        }),
        TextField.extend({
          isVisible: eq('parent.value.unit', raw(customUnit)),
        }).create({
          name: 'customUnit',
        }),
        TagsField.create({
          name: 'metrics',
          tagEditorComponentName: 'tags-input/time-series-metric-selector-editor',
          defaultValue: [],
          sort: true,
          valueToTags(value) {
            return (value || []).map((singleValue) => MetricTag.create({
              ownerSource: this,
              value: singleValue,
            }));
          },
          tagsToValue(tags) {
            return tags.mapBy('value');
          },
          sortTags(tags) {
            return tags.sort((tagA, tagB) => {
              const {
                aggregator: aAgg,
                resolution: aRes,
              } = get(tagA, 'value');
              const {
                aggregator: bAgg,
                resolution: bRes,
              } = get(tagB, 'value');
              if (aAgg !== bAgg) {
                return metricAggregators.indexOf(aAgg) - metricAggregators.indexOf(bAgg);
              } else {
                return aRes - bRes;
              }
            });
          },
        }),
      ],
    });
    newField.changeMode(this.get('mode'));
    return newField;
  },
});

/**
 * @param {Utils.FormComponent.ValuesContainer} values Values from time series store config editor
 * @returns {Object} store config
 */
function formValuesToStoreConfig(values) {
  const schemas = get(values, '__fieldsValueNames')
    .map((valueName) => get(values, valueName))
    .filter(Boolean)
    .map((timeSeriesSchemaValue) => {
      const {
        nameGeneratorType: formNameGeneratorType,
        nameGenerator: formNameGenerator,
        unit: formUnit,
        customUnit: formCustomUnit,
        metrics: formMetrics,
      } = getProperties(
        timeSeriesSchemaValue,
        'nameGeneratorType',
        'nameGenerator',
        'unit',
        'customUnit',
        'metrics'
      );

      const rawTimeSeriesSchema = {
        nameGeneratorType: formNameGeneratorType,
        nameGenerator: formNameGenerator,
      };
      if (formUnit === customUnit) {
        rawTimeSeriesSchema.unit = `${customUnitsPrefix}${formCustomUnit}`;
      } else {
        rawTimeSeriesSchema.unit = formUnit;
      }

      rawTimeSeriesSchema.metrics = (formMetrics || []).reduce((acc, metric) => {
        acc[metric.id] = {
          aggregator: metric.aggregator,
          resolution: metric.resolution,
          retention: metric.retention,
        };
        return acc;
      }, {});

      return rawTimeSeriesSchema;
    });
  return { schemas };
}

/**
 * @param {Object} storeConfig
 * @returns {Utils.FormComponent.ValuesContainer} form values ready to use in a form
 */
function storeConfigToFormValues(storeConfig) {
  const seriesFieldsValueNames = [];
  const values = createValuesContainer({
    __fieldsValueNames: seriesFieldsValueNames,
  });

  if (!storeConfig || !Array.isArray(storeConfig.schemas)) {
    return values;
  }

  storeConfig.schemas.forEach((rawTimeSeriesSchema, idx) => {
    if (!rawTimeSeriesSchema) {
      return;
    }

    const seriesFormGroupName = `schema${idx}`;

    const {
      nameGeneratorType,
      nameGenerator,
      unit,
      metrics,
    } = rawTimeSeriesSchema;

    const timeSeriesSchemaValue = {
      nameGeneratorType,
      nameGenerator,
    };

    if (unit.startsWith(customUnitsPrefix)) {
      timeSeriesSchemaValue.unit = customUnit;
      timeSeriesSchemaValue.customUnit = unit.slice(customUnitsPrefix.length);
    } else {
      timeSeriesSchemaValue.unit = unit;
    }

    timeSeriesSchemaValue.metrics = Object.keys(metrics || {}).map((metricId) => ({
      id: metricId,
      aggregator: metrics[metricId].aggregator,
      resolution: metrics[metricId].resolution,
      retention: metrics[metricId].retention,
    }));

    set(values, seriesFormGroupName, createValuesContainer(timeSeriesSchemaValue));
    seriesFieldsValueNames.push(seriesFormGroupName);
  });
  return values;
}

export default {
  formElement,
  formValuesToStoreConfig,
  storeConfigToFormValues,
};
