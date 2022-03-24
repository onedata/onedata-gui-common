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

import { set, get, getProperties, computed } from '@ember/object';
import { eq, raw } from 'ember-awesome-macros';
import FormFieldsGroup from 'onedata-gui-common/utils/form-component/form-fields-group';
import FormFieldsCollectionGroup from 'onedata-gui-common/utils/form-component/form-fields-collection-group';
import TextField from 'onedata-gui-common/utils/form-component/text-field';
import NumberField from 'onedata-gui-common/utils/form-component/number-field';
import DropdownField from 'onedata-gui-common/utils/form-component/dropdown-field';
import {
  customUnit,
  customUnitsPrefix,
  units,
} from 'onedata-gui-common/utils/atm-workflow/data-spec/time-series-measurements';
import {
  nameGeneratorTypes,
  metricAggregators,
  metricResolutions,
} from 'onedata-gui-common/utils/atm-workflow/store/time-series';
import { createValuesContainer } from 'onedata-gui-common/utils/form-component/values-container';

const formElement = FormFieldsCollectionGroup.extend({
  classes: 'time-series-store-config-editor',
  i18nPrefix: 'utils.atmWorkflow.storeConfigEditor.timeSeries.fields',
  // Does not take parent fields group translation path into account
  translationPath: '',
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
        FormFieldsCollectionGroup.extend({
          fieldFactoryMethod(uniqueFieldValueName2) {
            const newField = FormFieldsGroup.create({
              name: 'metric',
              valueName: uniqueFieldValueName2,
              fields: [
                TextField.create({
                  name: 'id',
                }),
                DropdownField.extend({
                  options: computed(function options() {
                    const i18n = this.get('i18n');
                    return metricAggregators.map((aggregator) => ({
                      value: aggregator,
                      label: translateMetricAggregator(i18n, aggregator),
                    }));
                  }),
                }).create({
                  name: 'aggregator',
                  defaultValue: metricAggregators[0],
                }),
                DropdownField.extend({
                  options: computed(function options() {
                    const i18n = this.get('i18n');
                    return metricResolutions.map(({ name, resolution }) => ({
                      value: resolution,
                      label: translateMetricResolution(i18n, name),
                    }));
                  }),
                }).create({
                  name: 'resolution',
                  defaultValue: metricResolutions[0].resolution,
                }),
                NumberField.create({
                  name: 'retention',
                  gte: 1,
                  integer: true,
                  defaultValue: '1000',
                }),
              ],
            });
            newField.changeMode(this.get('mode'));
            return newField;
          },
        }).create({
          name: 'metrics',
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
    .map(timeSeriesSchemaValue => {
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

      rawTimeSeriesSchema.metrics = {};
      get(formMetrics, '__fieldsValueNames')
        .map((valueName) => get(formMetrics, valueName))
        .filter(Boolean)
        .map((metricValue) => {
          const {
            id,
            aggregator,
            resolution,
            retention,
          } = getProperties(
            metricValue,
            'id',
            'aggregator',
            'resolution',
            'retention'
          );
          rawTimeSeriesSchema.metrics[id] = {
            aggregator,
            resolution,
            retention: Number.parseInt(retention),
          };
        });

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

    const metricFieldsValueNames = [];
    const metricValues = createValuesContainer({
      __fieldsValueNames: metricFieldsValueNames,
    });
    sortMetricValuesArray(
      Object.keys(metrics).map((id) => createValuesContainer({
        id,
        aggregator: metrics[id].aggregator,
        resolution: metrics[id].resolution,
        retention: String(metrics[id].retention),
      }))
    ).forEach((metricValue, idx) => {
      const metricFormGroupName = `metric${idx}`;
      set(metricValues, metricFormGroupName, metricValue);
      metricFieldsValueNames.push(metricFormGroupName);
    });
    timeSeriesSchemaValue.metrics = metricValues;

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

function translateNameGeneratorType(i18n, nameGeneratorType) {
  return i18n.t(`utils.atmWorkflow.store.timeSeries.nameGeneratorTypes.${nameGeneratorType}`);
}

function translateMetricResolution(i18n, metricResolution) {
  return i18n.t(`utils.atmWorkflow.store.timeSeries.metricResolutions.${metricResolution}`);
}

function translateMetricAggregator(i18n, metricAggregator) {
  return i18n.t(`utils.atmWorkflow.store.timeSeries.metricAggregators.${metricAggregator}`);
}

function translateUnit(i18n, unit) {
  return i18n.t(`utils.atmWorkflow.dataSpec.timeSeriesMeasurements.units.${unit}`);
}

function sortMetricValuesArray(metricValuesArray) {
  return metricValuesArray.sort((a, b) => {
    const {
      aggregator: aAgg,
      resolution: aRes,
    } = getProperties(a, 'aggregator', 'resolution');
    const {
      aggregator: bAgg,
      resolution: bRes,
    } = getProperties(b, 'aggregator', 'resolution');

    if (aAgg !== bAgg) {
      return metricAggregators.indexOf(aAgg) - metricAggregators.indexOf(bAgg);
    } else {
      return aRes - bRes;
    }
  });
}
