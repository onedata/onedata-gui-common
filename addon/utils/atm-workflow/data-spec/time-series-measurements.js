/**
 * Contains data related to "time series measurements" automation data spec.
 *
 * @module utils/atm-workflow/data-spec/time-series-measurements
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/**
 * @typedef {Object} TimeSeriesMeasurementsValueConstraints
 * @property {Array<TimeSeriesMeasurementsSpec>} specs
 */

/**
 * @typedef {Object} TimeSeriesMeasurementsSpec
 * @property {string} nameMatcherType for possible values see at `nameMatcherTypes` below
 * @property {string} nameMatcher
 * @property {string} unit for possible values see at `units` below
 */

export const nameMatcherTypes = [
  'exact',
  'hasPrefix',
];

// `custom` unit is a fake unit, which represents a custom unit provided by a user.
// When the custom unit is received/saved, it is prefixed with `custom:`
// (e.g. `custom:my_own_unit123`). That prefix allows to recognize which unit
// is a builtin one and which is custom.
export const customUnit = 'custom';
export const customUnitsPrefix = `${customUnit}:`;

export const units = [
  'none',
  'milliseconds',
  'seconds',
  'bits',
  'bytes',
  'hertz',
  'countsPerSec',
  'bytesPerSec',
  'operationsPerSec',
  'requestsPerSec',
  'readsPerSec',
  'writesPerSec',
  'ioOperationsPerSec',
  'percent',
  'percentNormalized',
  'boolean',
  customUnit,
];

/**
 * @param {Ember.Service} i18n
 * @param {string} prefixCombiner
 * @returns {SafeString}
 */
export function translateNameMatcherType(i18n, nameMatcherType) {
  return i18n.t(`utils.atmWorkflow.dataSpec.timeSeriesMeasurements.nameMatcherTypes.${nameMatcherType}`);
}

/**
 * @param {Ember.Service} i18n
 * @param {string} prefixCombiner
 * @returns {SafeString}
 */
export function translateUnit(i18n, unit) {
  return i18n.t(`utils.atmWorkflow.dataSpec.timeSeriesMeasurements.units.${unit}`);
}
