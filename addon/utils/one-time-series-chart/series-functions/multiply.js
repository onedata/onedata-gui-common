/**
 * A series function, which calculates result of multiplying given operands.
 *
 * Arguments:
 * - `operandProviders` - is an array of series function specs, each of which
 *   should evaluate to a function returning a number, an array of numbers or
 *   an array of points.
 *
 * NOTE: All array operands must have the same length. Otherwise, null will be returned.
 *
 * This function is an extension of `multiply` transform function, so it works
 * exactly the same for numbers and arrays for numbers. In case when one of
 * operands is an array of points, then the result will also be an array of points
 * with untouched timestamps and multiplied values. For example for operands
 * (after providers evaluation):
 * ```
 * [
 *    [2, 3],
 *    [{ timestamp: 1, value: 4 }, { timestamp: 2, value: 5 }],
 *    [{ timestamp: 1, value: 2 }, { timestamp: 2, value: 2 }],
 * ]
 * ```
 * result will be: `[{ timestamp: 1, value: 16 }, { timestamp: 2, value: 30 }]`.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { all as allFulfilled } from 'rsvp';
import reconcilePointsTiming from './utils/reconcile-points-timing';
import mergePointsArrays from './utils/merge-points-arrays';

/**
 * @typedef {Object} OTSCMultiplySeriesFunctionArguments
 * @property {Array<OTSCRawFunction>} operandProviders
 */

/**
 * @param {OTSCSeriesFunctionContext} context
 * @param {OTSCMultiplySeriesFunctionArguments} args
 * @returns {Promise<OTSCSeriesFunctionGenericResult<Array<number|null>|number|null>>}
 */
export default async function multiply(context, args) {
  const normalizedOperands = args && args.operandProviders || [];
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
      operandProviders: evaluatedOperands.map(operand => ({
        functionName: 'literal',
        functionArguments: {
          data: operand.type === 'points' ? operand.data.mapBy('value') : operand.data,
        },
      })),
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
