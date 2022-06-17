/**
 * A series function, which calculates an absolute value of given numbers.
 *
 * Arguments:
 * - `inputDataProvider` - must be a series function spec, which should evaluate
 *   to a function returning a number, an array of numbers or an array of points.
 *
 * This function is an extension of `abs` transform function, so it works
 * exactly the same for numbers and arrays of numbers. In case when evaluated data
 * is an array of points, then the result will also be an array of points
 * with untouched timestamps and transformed values. For example for input:
 * `[{ timestamp: 1, value: -4 }, { timestamp: 2, value: 5 }]` result will be:
 * `[{ timestamp: 1, value: 4 }, { timestamp: 2, value: 5 }]`.
 *
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import _ from 'lodash';

/**
 * @typedef {Object} OTSCAbsSeriesFunctionArguments
 * @property {OTSCRawFunction} inputDataProvider
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

  const evaluatedData =
    await context.evaluateSeriesFunction(context, args.inputDataProvider);
  const absValues = context.evaluateTransformFunction(null, {
    functionName: 'abs',
    functionArguments: {
      inputDataProvider: {
        functionName: 'literal',
        functionArguments: {
          data: evaluatedData.type === 'points' ?
            evaluatedData.data.mapBy('value') : evaluatedData.data,
        },
      },
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
