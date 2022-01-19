import _ from 'lodash';

/**
 * @typedef {Object} OneHistogramAbsSeriesFunctionArguments
 * @property {OneHistogramRawFunction|Array<number|null>|number|null} data
 */

/**
 * @param {OneHistogramSeriesFunctionContext} context
 * @param {OneHistogramAbsSeriesFunctionArguments} args
 * @returns {Promise<OneHistogramSeriesFunctionGenericResult<Array<number|null>|number|null>>}
 */
export default async function abs(context, args) {
  if (!args) {
    return {
      type: 'basic',
      data: null,
    };
  }

  const evaluatedData = await context.evaluateSeriesFunction(context, args.data);
  const absValues = context.evaluateTransformFunction(null, {
    functionName: 'abs',
    functionArguments: {
      data: evaluatedData.type === 'points' ?
        evaluatedData.data.mapBy('value') : evaluatedData.data,
    },
  });

  if (evaluatedData.type === 'points') {
    const result = _.cloneDeep(evaluatedData);
    result.data.forEach((point, idx) => point.value = absValues[idx]);
    return result;
  } else {
    return {
      type: 'basic',
      data: absValues,
    };
  }
}
