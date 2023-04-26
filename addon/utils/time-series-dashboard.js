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
  const i18nPath = `${i18nPrefix}.seriesTypes.${seriesType}`;
  return i18n.t(i18nPath, {}, { defaultValue: '' });
}
