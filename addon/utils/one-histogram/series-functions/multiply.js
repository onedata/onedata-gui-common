import { all as allFulfilled } from 'rsvp';
import { reconcileTiming, mergeHistogramPointsArrays } from './utils/points';

/**
 * @typedef {Object} OneHistogramMultiplySeriesFunctionArguments
 * @property {Array<OneHistogramRawFunction|number|null|Array<number|null>>} operands
 */

/**
 * @param {OneHistogramSeriesFunctionContext} context
 * @param {OneHistogramMultiplySeriesFunctionArguments} args
 * @returns {Promise<Array<OneHistogramSeriesPoint>|Array<number|null>|number|null>}
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
  const operandsWithPoints = evaluatedOperands.filterBy('type', 'series');
  const series = operandsWithPoints.mapBy('data');
  reconcileTiming(series);
  const multiplicationResult = context.evaluateTransformFunction(null, {
    functionName: 'multiply',
    functionArguments: {
      operands: evaluatedOperands.map(operand =>
        operandsWithPoints.includes(operand) ? operand.data.mapBy('value') : operand.data
      ),
    },
  });

  if (Array.isArray(multiplicationResult) && operandsWithPoints.length) {
    return {
      type: 'series',
      data: mergeHistogramPointsArrays(series, multiplicationResult),
    };
  } else {
    return {
      type: 'basic',
      data: multiplicationResult,
    };
  }
}
