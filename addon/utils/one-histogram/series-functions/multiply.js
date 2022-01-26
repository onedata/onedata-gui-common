/**
 * A series function, which calculates result of multiplying given operands.
 *
 * Arguments:
 * - `operands` - is an array of (mixed):
 *     - numbers,
 *     - arrays of numbers,
 *     - arrays of points,
 *     - series functions that will evaluate to one of above types.
 *
 * If some operands are series functions, then they are evaluated before further processing.
 * NOTE: All array operands (also those obtained from series functions evaluation)
 * must have the same length. Otherwise, null will be returned.
 *
 * This function is an extension of `multiply` transform function, so it works
 * exactly the same for numbers and arrays for numbers. In case when one of
 * operands is an array of points, then the result will also be an array of points
 * with untouched timestamps and multiplied values. For example for input:
 * ```
 * [
 *    [2, 3],
 *    [{ timestamp: 1, value: 4 }, { timestamp: 2, value: 5 }],
 *    [{ timestamp: 1, value: 2 }, { timestamp: 2, value: 2 }],
 * ]
 * ```
 * result will be: `[{ timestamp: 1, value: 16 }, { timestamp: 2, value: 30 }]`.
 *
 * @module utils/one-histogram/series-functions/multiply
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { all as allFulfilled } from 'rsvp';
import reconcilePointsTiming from './utils/reconcile-points-timing';
import mergePointsArrays from './utils/merge-points-arrays';

/**
 * @typedef {Object} OneHistogramMultiplySeriesFunctionArguments
 * @property {Array<OneHistogramRawFunction|Array<number|null>|number|null>} operands
 */

/**
 * @param {OneHistogramSeriesFunctionContext} context
 * @param {OneHistogramMultiplySeriesFunctionArguments} args
 * @returns {Promise<OneHistogramSeriesFunctionGenericResult<Array<number|null>|number|null>>}
 */
export default async function multiply(context, args) {
  const normalizedOperands = args && args.operands || [];
  if (!Array.isArray(normalizedOperands) || !normalizedOperands.length) {
    return {
      type: 'basic',
      data: null,
    };
  }

  const evaluatedOperands = await allFulfilled(
    normalizedOperands.map(value => context.evaluateSeriesFunction(context, value))
  );
  const operandsWithPoints = evaluatedOperands.filterBy('type', 'points');
  const series = operandsWithPoints.mapBy('data');
  reconcilePointsTiming(series);
  const multiplicationResult = context.evaluateTransformFunction(null, {
    functionName: 'multiply',
    functionArguments: {
      operands: evaluatedOperands.map(operand =>
        operand.type === 'points' ? operand.data.mapBy('value') : operand.data
      ),
    },
  });

  if (Array.isArray(multiplicationResult) && operandsWithPoints.length) {
    return {
      type: 'points',
      data: mergePointsArrays(series, multiplicationResult),
    };
  } else {
    return {
      type: 'basic',
      data: multiplicationResult,
    };
  }
}
