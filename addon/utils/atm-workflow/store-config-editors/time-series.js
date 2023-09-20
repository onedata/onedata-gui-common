/**
 * Provides a form element capable of showing and modifying time
 * series store config. It also provides two methods
 * for conversion between form values and store config in both directions.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import {
  set,
  get,
  getProperties,
  computed,
  observer,
  defineProperty,
} from '@ember/object';
import { eq, raw } from 'ember-awesome-macros';
import { validator } from 'ember-cp-validations';
import FormFieldsGroup from 'onedata-gui-common/utils/form-component/form-fields-group';
import FormFieldsCollectionGroup from 'onedata-gui-common/utils/form-component/form-fields-collection-group';
import TextField from 'onedata-gui-common/utils/form-component/text-field';
import DropdownField from 'onedata-gui-common/utils/form-component/dropdown-field';
import TagsField from 'onedata-gui-common/utils/form-component/tags-field';
import {
  timeSeriesNameGeneratorTypes,
  timeSeriesStandardUnits,
  translateTimeSeriesStandardUnit,
  timeSeriesCustomUnitPrefix,
  timeSeriesMetricAggregators,
  translateTimeSeriesNameGeneratorType,
} from 'onedata-gui-common/utils/time-series';
import {
  default as ChartsDashboardEditor,
  formValueToChartsDashboardSpec,
  chartsDashboardSpecToFormValue,
} from 'onedata-gui-common/utils/atm-workflow/charts-dashboard-editor';
import { createValuesContainer } from 'onedata-gui-common/utils/form-component/values-container';
import { Tag as MetricTag } from 'onedata-gui-common/components/tags-input/time-series-metric-selector-editor';

// A fake unit used to indicate that user provides some non-standard unit.
const customPseudoUnit = 'custom';

const FormElement = FormFieldsGroup.extend({
  classes: 'time-series-store-config-editor',
  i18nPrefix: 'utils.atmWorkflow.storeConfigEditors.timeSeries.fields',
  // Does not take parent fields group translation path into account
  translationPath: '',
  fields: computed(() => [
    timeSeriesSchemasField.create(),
    dashboardSpecField.create(),
  ]),
});

const timeSeriesSchemasField = FormFieldsCollectionGroup.extend({
  name: 'timeSeriesSchemas',
  classes: 'nowrap-on-desktop boxes-collection-layout',
  sizeForChildren: 'sm',
  usedNameGeneratorsSetter: observer(
    'value.__fieldsValueNames',
    function usedNameGeneratorsSetter() {
      const namePropsPaths = (this.get('value.__fieldsValueNames') || [])
        .map(entryValueName => `value.${entryValueName}.nameGenerator`);
      defineProperty(
        this,
        'usedNameGenerators',
        computed(...namePropsPaths, function usedNameGenerators() {
          return namePropsPaths
            .map((propPath) => (this.get(propPath) || '').trim())
            .filter(Boolean);
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
            return timeSeriesNameGeneratorTypes.map((nameGeneratorType) => ({
              value: nameGeneratorType,
              label: translateTimeSeriesNameGeneratorType(i18n, nameGeneratorType),
            }));
          }),
        }).create({
          name: 'nameGeneratorType',
          defaultValue: timeSeriesNameGeneratorTypes[0],
        }),
        TextField.create({
          name: 'nameGenerator',
          customValidators: [
            validator('inline', {
              validate(value, options, model) {
                const trimmedValue = (value || '').trim();
                if (!trimmedValue) {
                  return true;
                }
                const field = get(model, 'field');
                const errorMsg = String(field.getTranslation('errors.notUnique'));
                const usedNameGenerators = get(model, 'field.parent.parent.usedNameGenerators');
                return usedNameGenerators
                  .filter((usedNameGenerator) => {
                    const trimmedUsedNameGenerator = usedNameGenerator.trim();
                    return trimmedUsedNameGenerator.startsWith(trimmedValue) ||
                      trimmedValue.startsWith(trimmedUsedNameGenerator);
                  }).length <= 1 ? true : errorMsg;
              },
              dependentKeys: ['model.field.parent.parent.usedNameGenerators'],
            }),
          ],
        }),
        DropdownField.extend({
          options: computed(function options() {
            const i18n = this.get('i18n');
            return [...timeSeriesStandardUnits, customPseudoUnit].map((unit) => ({
              value: unit,
              label: unit !== customPseudoUnit ?
                translateTimeSeriesStandardUnit(i18n, unit) : undefined,
            }));
          }),
        }).create({
          name: 'unit',
          defaultValue: timeSeriesStandardUnits[0],
        }),
        TextField.extend({
          isVisible: eq('parent.value.unit', raw(customPseudoUnit)),
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
                return timeSeriesMetricAggregators.indexOf(aAgg) -
                  timeSeriesMetricAggregators.indexOf(bAgg);
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

const dashboardSpecField = ChartsDashboardEditor.extend({
  name: 'dashboardSpec',
});

/**
 * @param {Utils.FormComponent.ValuesContainer} values Values from time series store config editor
 * @returns {AtmTimeSeriesStoreConfig} store config
 */
function formValuesToStoreConfig(values) {
  const {
    timeSeriesSchemas: formTimeSeriesSchemas,
    dashboardSpec,
  } = getProperties(values, 'timeSeriesSchemas', 'dashboardSpec');
  const timeSeriesSchemas = get(formTimeSeriesSchemas, '__fieldsValueNames')
    .map((valueName) => get(formTimeSeriesSchemas, valueName))
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
      if (formUnit === customPseudoUnit) {
        rawTimeSeriesSchema.unit = `${timeSeriesCustomUnitPrefix}${formCustomUnit}`;
      } else {
        rawTimeSeriesSchema.unit = formUnit;
      }

      rawTimeSeriesSchema.metrics = (formMetrics || []).reduce((acc, metric) => {
        acc[metric.name] = {
          aggregator: metric.aggregator,
          resolution: metric.resolution,
          retention: metric.retention,
        };
        return acc;
      }, {});

      return rawTimeSeriesSchema;
    });

  return {
    timeSeriesCollectionSchema: {
      timeSeriesSchemas,
    },
    dashboardSpec: formValueToChartsDashboardSpec(dashboardSpec),
  };
}

/**
 * @param {AtmTimeSeriesStoreConfig} storeConfig
 * @returns {Utils.FormComponent.ValuesContainer} form values ready to use in a form
 */
function storeConfigToFormValues(storeConfig) {
  const timeSeriesSchemasFieldsValueNames = [];
  const timeSeriesSchemas = createValuesContainer({
    __fieldsValueNames: timeSeriesSchemasFieldsValueNames,
  });
  const values = createValuesContainer({
    timeSeriesSchemas,
    dashboardSpec: chartsDashboardSpecToFormValue(storeConfig?.dashboardSpec),
  });

  const rawTimeseriesSchemas =
    storeConfig?.timeSeriesCollectionSchema?.timeSeriesSchemas;
  rawTimeseriesSchemas?.forEach((rawTimeSeriesSchema, idx) => {
    if (!rawTimeSeriesSchema) {
      return;
    }

    const schemaFormGroupName = `schema${idx}`;

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

    if (unit.startsWith(timeSeriesCustomUnitPrefix)) {
      timeSeriesSchemaValue.unit = customPseudoUnit;
      timeSeriesSchemaValue.customUnit = unit.slice(timeSeriesCustomUnitPrefix.length);
    } else {
      timeSeriesSchemaValue.unit = unit;
    }

    timeSeriesSchemaValue.metrics = Object.keys(metrics || {}).map((metricName) => ({
      name: metricName,
      aggregator: metrics[metricName].aggregator,
      resolution: metrics[metricName].resolution,
      retention: metrics[metricName].retention,
    }));

    set(
      timeSeriesSchemas,
      schemaFormGroupName,
      createValuesContainer(timeSeriesSchemaValue)
    );
    timeSeriesSchemasFieldsValueNames.push(schemaFormGroupName);
  });

  return values;
}

export default {
  FormElement,
  formValuesToStoreConfig,
  storeConfigToFormValues,
};
