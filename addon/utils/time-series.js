/**
 * Contains typedefs, constants and functions related to time series.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import _ from 'lodash';

const i18nPrefix = 'utils.timeSeries';

/**
 * @typedef {Object} TimeSeriesCollectionSchema
 * @property {Array<TimeSeriesSchema>} timeSeriesSchemas
 */

/**
 * @typedef {Object} TimeSeriesSchema
 * @property {TimeSeriesNameGeneratorType} nameGeneratorType
 * @property {string} nameGenerator
 * @property {TimeSeriesUnit} unit
 * @property {Object<string,TimeSeriesMetric>} metrics keys are metric IDs
 */

/**
 * @typedef {'exact'|'addPrefix'} TimeSeriesNameGeneratorType
 */

/**
 * @type {Array<TimeSeriesNameGeneratorType>}
 */
export const timeSeriesNameGeneratorTypes = [
  'exact',
  'addPrefix',
];

/**
 * @param {Ember.Service} i18n
 * @param {TimeSeriesNameGeneratorType} timeSeriesNameGeneratorType
 * @returns {SafeString}
 */
export function translateTimeSeriesNameGeneratorType(i18n, timeSeriesNameGeneratorType) {
  const i18nPath = `${i18nPrefix}.timeSeriesNameGeneratorTypes.${timeSeriesNameGeneratorType}`;
  return i18n.t(i18nPath, {}, { defaultValue: '' });
}

/**
 * @typedef {TimeSeriesStandardUnit | TimeSeriesCustomUnit} TimeSeriesUnit
 */

/**
 * @typedef {
 *   'none' |
 *   'milliseconds' |
 *   'seconds' |
 *   'bits' |
 *   'bytes' |
 *   'hertz' |
 *   'countsPerSec' |
 *   'bitsPerSec' |
 *   'bytesPerSec' |
 *   'operationsPerSec' |
 *   'requestsPerSec' |
 *   'readsPerSec' |
 *   'writesPerSec' |
 *   'ioOperationsPerSec' |
 *   'percent' |
 *   'percentNormalized' |
 *   'boolean'
 * } TimeSeriesStandardUnit
 */

/**
 * @type {Array<TimeSeriesUnit>}
 */
export const timeSeriesStandardUnits = [
  'none',
  'milliseconds',
  'seconds',
  'bits',
  'bytes',
  'hertz',
  'countsPerSec',
  'bitsPerSec',
  'bytesPerSec',
  'operationsPerSec',
  'requestsPerSec',
  'readsPerSec',
  'writesPerSec',
  'ioOperationsPerSec',
  'percent',
  'percentNormalized',
  'boolean',
];

/**
 * @param {Ember.Service} i18n
 * @param {TimeSeriesStandardUnit} timeSeriesStandardUnit
 * @returns {SafeString}
 */
export function translateTimeSeriesStandardUnit(i18n, timeSeriesStandardUnit) {
  const i18nPath = `${i18nPrefix}.timeSeriesStandardUnits.${timeSeriesStandardUnit}`;
  return i18n.t(i18nPath, {}, { defaultValue: '' });
}

/**
 * @typedef {`custom:${string}`} TimeSeriesCustomUnit
 */

/**
 * When the custom unit is received/saved, it is prefixed with `custom:`
 * (e.g. `custom:my_own_unit123`). That prefix allows to recognize which unit
 * is a built-in one and which is custom.
 * @type {string}
 */
export const timeSeriesCustomUnitPrefix = 'custom:';

/**
 * @typedef {Object} TimeSeriesMetric
 * @property {TimeSeriesMetricAggregator} aggregator
 * @property {TimeSeriesMetricResolution} resolution
 * @property {number} retention
 */

/**
 * @typedef {'sum'|'max'|'min'|'first'|'last'} TimeSeriesMetricAggregator
 */

/**
 * @type {Array<TimeSeriesMetricAggregator>}
 */
export const timeSeriesMetricAggregators = [
  'sum',
  'max',
  'min',
  'first',
  'last',
];

/**
 * @param {Ember.Service} i18n
 * @param {TimeSeriesMetricAggregator} timeSeriesMetricAggregator
 * @param {{ short: boolean }} options
 * @returns {SafeString}
 */
export function translateTimeSeriesMetricAggregator(
  i18n,
  timeSeriesMetricAggregator, { short = false } = {}
) {
  const i18nPath =
    `${i18nPrefix}.timeSeriesMetricAggregators.${short ? 'short' : 'standard'}.${timeSeriesMetricAggregator}`;
  return i18n.t(i18nPath, {}, { defaultValue: '' });
}

/**
 * @typedef {5|60|3600|86400|604800|2592000|31536000|0} TimeSeriesMetricResolution
 * Values represents: 5 seconds, 1 minute, 1 hour, 1 day, 1 week, 1 month,
 * 1 year, infinity.
 */

/**
 * @type {Object<string, TimeSeriesMetricResolution>}
 */
export const timeSeriesMetricResolutionsMap = {
  fiveSeconds: 5,
  minute: 60,
  hour: 60 * 60,
  day: 24 * 60 * 60,
  week: 7 * 24 * 60 * 60,
  month: 30 * 24 * 60 * 60,
  year: 365 * 24 * 60 * 60,
  infinity: 0,
};

/**
 * @type {Array<TimeSeriesMetricResolution>}
 */
export const timeSeriesMetricResolutions = [
  timeSeriesMetricResolutionsMap.fiveSeconds,
  timeSeriesMetricResolutionsMap.minute,
  timeSeriesMetricResolutionsMap.hour,
  timeSeriesMetricResolutionsMap.day,
  timeSeriesMetricResolutionsMap.week,
  timeSeriesMetricResolutionsMap.month,
  timeSeriesMetricResolutionsMap.year,
  timeSeriesMetricResolutionsMap.infinity,
];

const invertedTimeSeriesMetricResolutionsMap = _.invert(timeSeriesMetricResolutionsMap);

/**
 * @param {Ember.Service} i18n
 * @param {TimeSeriesMetricResolution} timeSeriesMetricResolution
 * @param {{ short: boolean }} options
 * @returns {SafeString}
 */
export function translateTimeSeriesMetricResolution(
  i18n,
  timeSeriesMetricResolution, { short = false } = {}
) {
  const timeSeriesMetricResolutionName =
    invertedTimeSeriesMetricResolutionsMap[timeSeriesMetricResolution];
  const i18nPath = timeSeriesMetricResolutionName &&
    `${i18nPrefix}.timeSeriesMetricResolutions.${short ? 'short' : 'standard'}.${timeSeriesMetricResolutionName}`;
  return i18nPath ? i18n.t(i18nPath, {}, { defaultValue: '' }) : '';
}

/**
 * @typedef {Object<string, Array<string>} TimeSeriesCollectionLayout
 *   is a map (seriesName -> (array of metric names))
 */

/**
 * @typedef {Object} TimeSeriesCollectionSliceQueryParams
 * @property {TimeSeriesCollectionLayout} layout
 * @property {number|null} startTimestamp
 * @property {number} windowLimit
 */

/**
 * @typedef {Object<string, Object<string, Array<TimeSeriesWindow>>} TimeSeriesCollectionSlice
 *   is a nested map (seriesName -> (metricName -> array of windows))
 */

/**
 * @typedef {Object} TimeSeriesWindow
 * @property {number} timestamp
 * @property {number} value
 */
