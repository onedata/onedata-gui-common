/**
 * Contains data related to "time series" automation stores.
 *
 * @module utils/atm-workflow/store-config/time-series
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import _ from 'lodash';
import { commonDataSpecFilters } from './commons';

/**
 * @typedef {Object} AtmTimeSeriesStoreConfig
 * @property {Array<AtmTimeSeriesSchema>} schemas
 * @property {Array<OTSCChartDefinition>} chartSpecs
 */

/**
 * @typedef {Object} AtmTimeSeriesSchema
 * @property {string} nameGeneratorType for possible values see at
 * `nameGeneratorTypes` below
 * @property {string} nameGenerator
 * @property {string} unit for possible values see at `units` in
 * `timeSeriesMeasurement` data spec
 * @property {Object<string,TimeSeriesMetric>} metrics keys are metric IDs
 */

/**
 * @typedef {Object} TimeSeriesMetric
 * @property {string} aggregator for possible values see at
 * `metricAggregators` below
 * @property {number} resolution for possible values see at
 * `metricResolutions` below
 * @property {number} retention
 */

export const nameGeneratorTypes = [
  'exact',
  'addPrefix',
];

export const metricResolutionsMap = {
  fiveSeconds: 5,
  minute: 60,
  hour: 60 * 60,
  day: 24 * 60 * 60,
  week: 7 * 24 * 60 * 60,
  month: 30 * 24 * 60 * 60,
  year: 365 * 24 * 60 * 60,
  infinity: 0,
};

export const metricResolutions = [
  metricResolutionsMap.fiveSeconds,
  metricResolutionsMap.minute,
  metricResolutionsMap.hour,
  metricResolutionsMap.day,
  metricResolutionsMap.week,
  metricResolutionsMap.month,
  metricResolutionsMap.year,
  metricResolutionsMap.infinity,
];

export const metricAggregators = [
  'sum',
  'max',
  'min',
  'first',
  'last',
];

/**
 * @param {Ember.Service} i18n
 * @param {string} nameGeneratorType
 * @returns {SafeString}
 */
export function translateNameGeneratorType(i18n, nameGeneratorType) {
  const i18nPath = `utils.atmWorkflow.storeConfig.timeSeries.nameGeneratorTypes.${nameGeneratorType}`;
  return i18n.t(i18nPath, {}, { defaultValue: '' });
}

const invertedMetricResolutionsMap = _.invert(metricResolutionsMap);

/**
 * @param {Ember.Service} i18n
 * @param {string} metricResolution
 * @param {{ short: boolean }} options
 * @returns {SafeString}
 */
export function translateMetricResolution(
  i18n,
  metricResolution, { short = false } = {}
) {
  const metricResolutionName = invertedMetricResolutionsMap[metricResolution];
  const i18nPath = metricResolutionName &&
    `utils.atmWorkflow.storeConfig.timeSeries.metricResolutions.${short ? 'short' : 'standard'}.${metricResolutionName}`;
  return i18nPath ? i18n.t(i18nPath, {}, { defaultValue: '' }) : '';
}

/**
 * @param {Ember.Service} i18n
 * @param {string} metricAggregator
 * @param {{ short: boolean }} options
 * @returns {SafeString}
 */
export function translateMetricAggregator(
  i18n,
  metricAggregator, { short = false } = {}
) {
  const i18nPath =
    `utils.atmWorkflow.storeConfig.timeSeries.metricAggregators.${short ? 'short' : 'standard'}.${metricAggregator}`;
  return i18n.t(i18nPath, {}, { defaultValue: '' });
}

/**
 * @returns {Array<DataSpecFilter>}
 */
export function getReadDataSpecFilters() {
  return [...commonDataSpecFilters, {
    filterType: 'typeOrSupertype',
    types: [{ type: 'timeSeriesMeasurement' }],
  }];
}

/**
 * @returns {Array<DataSpecFilter>}
 */
export function getWriteDataSpecFilters() {
  return [...commonDataSpecFilters, {
    filterType: 'typeOrSubtype',
    types: [{ type: 'timeSeriesMeasurement' }],
  }];
}

export default {
  nameGeneratorTypes,
  metricResolutionsMap,
  metricResolutions,
  metricAggregators,
  translateNameGeneratorType,
  translateMetricResolution,
  translateMetricAggregator,
  getReadDataSpecFilters,
  getWriteDataSpecFilters,
};
