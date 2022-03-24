/**
 * Contains data related to "time series" automation stores.
 *
 * @module utils/atm-workflow/store-config/time-series
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/**
 * @typedef {Object} TimeSeriesStoreConfig
 * @property {Array<TimeSeriesSchema>} schemas
 */

/**
 * @typedef {Object} TimeSeriesSchema
 * @property {string} nameGeneratorType for possible values see at
 * `nameGeneratorTypes` below
 * @property {string} nameGenerator
 * @property {string} unit for possible values see at `units` in
 * `timeSeriesMeasurements` data spec
 * @property {Object<string,TimeSeriesMetric>} metrics keys are metric IDs
 */

/**
 * @typedef {Object} TimeSeriesMetric
 * @property {string} aggregator for possible values see at
 * `metricAggregators` below
 * @property {number} resolution for possible values see at numeric values in
 * `metricResolutions` below
 * @property {number} retention
 */

export const nameGeneratorTypes = [
  'exact',
  'addPrefix',
];

export const metricResolutions = [{
  name: 'fiveSeconds',
  resolution: 5,
}, {
  name: 'minute',
  resolution: 60,
}, {
  name: 'hour',
  resolution: 60 * 60,
}, {
  name: 'day',
  resolution: 24 * 60 * 60,
}, {
  name: 'week',
  resolution: 7 * 24 * 60 * 60,
}, {
  name: 'month',
  resolution: 30 * 24 * 60 * 60,
}, {
  name: 'year',
  resolution: 365 * 24 * 60 * 60,
}, {
  name: 'infinity',
  resolution: 0,
}];

export const metricAggregators = [
  'sum',
  'max',
  'min',
  'first',
  'last',
];

export function translateNameGeneratorType(i18n, nameGeneratorType) {
  return i18n.t(`utils.atmWorkflow.storeConfig.timeSeries.nameGeneratorTypes.${nameGeneratorType}`);
}

export function translateMetricResolution(i18n, metricResolution) {
  return i18n.t(`utils.atmWorkflow.storeConfig.timeSeries.metricResolutions.${metricResolution}`);
}

export function translateMetricAggregator(i18n, metricAggregator) {
  return i18n.t(`utils.atmWorkflow.storeConfig.timeSeries.metricAggregators.${metricAggregator}`);
}
