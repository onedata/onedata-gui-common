import _ from 'lodash';
import { isHistogramPointsArray } from './utils/points';

/**
 * @typedef {Object} OneHistogramAbsSeriesFunctionArguments
 * @property {OneHistogramRawFunction|Array<number|null>|number|null} data
 */

/**
 * @param {OneHistogramSeriesFunctionContext} context
 * @param {OneHistogramAbsSeriesFunctionArguments} args
 * @returns {Promise<Array<OneHistogramSeriesPoint>|Array<number|null>|number|null>}
 */
export default async function abs(context, args) {
  if (!args) {
    return null;
  }

  const evaluatedData = await context.evaluateSeriesFunction(context, args.data);
  const isDataAPointsArray = isHistogramPointsArray(evaluatedData);
  const absValues = context.evaluateTransformFunction(null, {
    functionName: 'abs',
    functionArguments: {
      data: isDataAPointsArray ? evaluatedData.mapBy('value') : evaluatedData,
    },
  });

  if (isDataAPointsArray) {
    const result = _.cloneDeep(evaluatedData);
    result.forEach((point, idx) => point.value = absValues[idx]);
    return result;
  } else {
    return absValues;
  }
}
