/**
 * Contains data related to "time series" automation stores content update options.
 *
 * @module utils/atm-workflow/store-content-update-options/time-series
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
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
