/**
 * Contains typedefs, constants and functions related to time series dashboard.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

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

/**
 * @param {Ember.Service} i18n
 * @param {SeriesType} seriesType
 * @returns {SafeString}
 */
export function translateSeriesType(i18n, seriesType) {
  return i18n.t(`${i18nPrefix}.seriesTypes.${seriesType}`);
}
