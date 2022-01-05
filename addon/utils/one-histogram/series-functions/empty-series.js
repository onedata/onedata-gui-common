import loadSeries from './load-series';

/**
 * @param {OneHistogramSeriesFunctionContext} context
 * @returns {Promise<Array<OneHistogramSeriesPoint[]>>}
 */
export default async function emptySeries(context) {
  return await loadSeries(context, {
    sourceType: 'constValue',
    sourceParameters: {
      value: null,
    },
  });
}
