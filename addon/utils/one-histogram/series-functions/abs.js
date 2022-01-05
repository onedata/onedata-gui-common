import _ from 'lodash';
import emptySeries from './empty-series';

/**
 * @typedef {Object} OneHistogramAbsSeriesFunctionArguments
 * @property {OneHistogramRawFunction} data
 */

/**
 * @param {OneHistogramSeriesFunctionContext} context
 * @param {OneHistogramAbsSeriesFunctionArguments} args
 * @returns {Promise<Array<OneHistogramSeriesPoint[]>>}
 */
export default async function abs(context, args) {
  if (!args || !args.data) {
    return emptySeries(context);
  }

  const evaluatedData = await context.evaluateSeriesFunction(context, args.data);
  const absValues = context.evaluateTransformFunction(null, {
    functionName: 'abs',
    functionArguments: {
      data: evaluatedData.mapBy('value'),
    },
  });

  const result = _.cloneDeep(evaluatedData);
  result.forEach((point, idx) => point.value = absValues[idx]);

  return result;
}
