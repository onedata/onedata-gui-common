/**
 * Contains type definitions, data and utils related to "time series measurement"
 * automation data spec.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { doesAtmDataSpecMatchFilters } from '../filters';

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
 * @property {Array<AtmTimeSeriesMeasurementSpec>|null} allowedSpecs for subtype
 * @property {Array<AtmTimeSeriesMeasurementSpec>|null} requiredSpecs for supertype
 */

/**
 * @type {AtmDataSpecTypeDefinition<AtmTimeSeriesMeasurementValueConstraints, AtmTimeSeriesMeasurementValueConstraintsConditions>}
 */
export const atmDataSpecTypeDefinition = {
  supertype: 'object',
  canValueConstraintsContain() {
    return true;
  },
  getValueConstraintsConditions() {
    return null;
  },
  isMatchingFilters(atmDataSpec, filters, context) {
    return doesAtmDataSpecMatchFilters(atmDataSpec, filters, context);
  },
};

/**
 * @typedef {Object} AtmTimeSeriesMeasurementSpec
 * @property {'exact'|'hasPrefix'} nameMatcherType
 * @property {string} nameMatcher
 * @property {TimeSeriesUnit} unit
 */

export const nameMatcherTypes = [
  'exact',
  'hasPrefix',
];

/**
 * @param {Ember.Service} i18n
 * @param {string} nameMatcherType
 * @returns {SafeString}
 */
export function translateNameMatcherType(i18n, nameMatcherType) {
  return i18n.t(`utils.atmWorkflow.dataSpec.timeSeriesMeasurement.nameMatcherTypes.${nameMatcherType}`);
}
