/**
 * Contains data related to "time series" automation stores content update options.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/**
 * @typedef {Object} AtmTimeSeriesStoreContentUpdateOptions
 * @property {'timeSeriesStoreContentUpdateOptions'} type
 * @property {Array<AtmTimeSeriesStoreDispatchRule>} dispatchRules
 */

/**
 * @typedef {Object} AtmTimeSeriesStoreDispatchRule
 * @property {string} measurementTimeSeriesNameMatcherType
 * @property {string} measurementTimeSeriesNameMatcher
 * @property {string} targetTimeSeriesNameGenerator
 * @property {string} [prefixCombiner] for possible values see at `prefixCombiners` below
 */

export const prefixCombiners = [
  'concatenate',
  'converge',
  'overwrite',
];

/**
 * @param {Ember.Service} i18n
 * @param {string} prefixCombiner
 * @returns {SafeString}
 */
export function translatePrefixCombiner(i18n, prefixCombiner) {
  return i18n.t(`utils.atmWorkflow.storeContentUpdateOptions.timeSeries.prefixCombiners.${prefixCombiner}`);
}
