/**
 * A transform function, which calculates an absolute value of given numbers.
 *
 * Arguments:
 * - `data` - must be of type:
 *     - number,
 *     - array of numbers,
 *     - array of points,
 *     - series function that will evaluate to one of above types.
 *
 * If `data` is a series function, it is evaluated before further processing.
 *
 * This function is an extension of `abs` transform function, so it works
 * exactly the same for numbers and arrays for numbers. In case when `data`
 * is an array of points, then the result will also be an array of points
 * with untouched timestamps and transformed values. For example for input:
 * `[{ timestamp: 1, value: -4 }, { timestamp: 2, value: 5 }]` result will be:
 * `[{ timestamp: 1, value: 4 }, { timestamp: 2, value: 5 }]`.
 *
 *
 * @module utils/one-time-series-chart/series-functions/abs
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import _ from 'lodash';

/**
 * @typedef {Object} OTSCAbsSeriesFunctionArguments
 * @property {OTSCRawFunction|Array<number|null>|number|null} data
 */

/**
 * @param {OTSCSeriesFunctionContext} context
 * @param {OTSCAbsSeriesFunctionArguments} args
 * @returns {Promise<OTSCSeriesFunctionGenericResult<Array<number|null>|number|null>>}
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
