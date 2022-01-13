import { all as allFulfilled } from 'rsvp';
import { isHistogramPointsArray, reconcileTiming } from './utils/points';

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
    return null;
  }

  const evaluatedOperands = await allFulfilled(
    normalizedOperands.map(value => context.evaluateSeriesFunction(context, value))
  );
  const operandsWithPoints = evaluatedOperands.filter(operand =>
    isHistogramPointsArray(operand)
  );
  reconcileTiming(operandsWithPoints);
  const multiplicationResult = context.evaluateTransformFunction(null, {
    functionName: 'multiply',
    functionArguments: {
      operands: evaluatedOperands.map(operand =>
        operandsWithPoints.includes(operand) ? operand.mapBy('value') : operand
      ),
    },
  });

  if (Array.isArray(multiplicationResult)) {
    if (operandsWithPoints[0]) {
      return multiplicationResult.map((value, idx) => ({
        timestamp: operandsWithPoints[0][idx].timestamp,
        value,
      }));
    }
  }
  return multiplicationResult;
}
