/**
 * Contains type definitions, data and utils related to "time series measurement"
 * automation data spec.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { typeDefinitionBase } from './commons';

/**
 * @typedef {Object} AtmTimeSeriesMeasurementDataSpec
 * @property {'timeSeriesMeasurement'} type
 * @property {AtmTimeSeriesMeasurementValueConstraints} valueConstraints
 */

/**
 * @typedef {Object} AtmTimeSeriesMeasurementValueConstraints
 * @property {Array<AtmTimeSeriesMeasurementSpec>} specs
 */

/**
 * @typedef {Object} AtmTimeSeriesMeasurementValueConstraintsConditions
 * TODO: VFS-10007 implement understanding these conditions
 * @property {Array<AtmTimeSeriesMeasurementSpec>|null} allowedSpecs for subtype
 * @property {Array<AtmTimeSeriesMeasurementSpec>|null} requiredSpecs for supertype
 */

/**
 * @type {AtmDataSpecTypeDefinition<AtmTimeSeriesMeasurementValueConstraints, AtmTimeSeriesMeasurementValueConstraintsConditions>}
 */
export const atmDataSpecTypeDefinition = Object.freeze({
  ...typeDefinitionBase,
  supertype: 'object',
  getDefaultValue() {
    return {
      timestamp: Math.floor(Date.now() / 1000),
      tsName: '',
      value: 0,
    };
  },
  // TODO: VFS-10007 implement `getValueConstraintsConditions`
});

/**
 * @typedef {Object} AtmTimeSeriesMeasurementSpec
 * @property {'exact'|'hasPrefix'} nameMatcherType
 * @property {string} nameMatcher
 * @property {TimeSeriesUnit} unit
 */

export const nameMatcherTypes = Object.freeze([
  'exact',
  'hasPrefix',
]);

/**
 * @param {Ember.Service} i18n
 * @param {string} nameMatcherType
 * @returns {SafeString}
 */
export function translateNameMatcherType(i18n, nameMatcherType) {
  return i18n.t(`utils.atmWorkflow.dataSpec.timeSeriesMeasurement.nameMatcherTypes.${nameMatcherType}`);
}
