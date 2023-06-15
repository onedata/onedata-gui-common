/**
 * Contains typedefs, constants and functions related to time series dashboard.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { assert } from '@ember/debug';
import _ from 'lodash';

const i18nPrefix = 'utils.timeSeriesDashboard';

/**
 * @typedef {'bar' | 'line'} SeriesType
 */

/**
 * @type {Object<string, SeriesType>}
 */
export const SeriesType = Object.freeze({
  Bar: 'bar',
  Line: 'line',
});

/**
 * @type {Array<SeriesType>}
 */
export const seriesTypes = Object.freeze([
  SeriesType.Bar,
  SeriesType.Line,
]);

assert(
  '`seriesTypes` and `SeriesType` have to have the same values set.',
  _.isEqual(Object.values(SeriesType).sort(), [...seriesTypes].sort())
);

/**
 * @param {Ember.Service} i18n
 * @param {SeriesType} seriesType
 * @returns {SafeString}
 */
export function translateSeriesType(i18n, seriesType) {
  return i18n.t(`${i18nPrefix}.seriesTypes.${seriesType}`);
}

/**
 * @typedef {'useFallback' | 'usePrevious'} ReplaceEmptyStrategy
 */

/**
 * @type {Object<string, ReplaceEmptyStrategy>}
 */
export const ReplaceEmptyStrategy = Object.freeze({
  UseFallback: 'useFallback',
  UsePrevious: 'usePrevious',
});
