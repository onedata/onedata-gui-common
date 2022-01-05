import { all as allFulfilled } from 'rsvp';
import emptySeries from './empty-series';
import { isHistogramPointsArray } from './utils/points';

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
  if (!normalizedOperands.length) {
    return emptySeries(context);
  }

  const evaluatedOperands = await allFulfilled(
    normalizedOperands.map(value => context.evaluateSeriesFunction(context, value))
  );
  const multiplicationResult = context.evaluateTransformFunction(null, {
    functionName: 'multiply',
    functionArguments: {
      operands: evaluatedOperands.map(operand =>
        isHistogramPointsArray(operand) ? operand.mapBy('value') : operand
      ),
    },
  });

  if (Array.isArray(multiplicationResult)) {
    const operandWithPoints = evaluatedOperands.find(operand =>
      isHistogramPointsArray(operand)
    );
    if (operandWithPoints) {
      return multiplicationResult.map((value, idx) => ({
        timestamp: operandWithPoints[idx].timestamp,
        value,
      }));
    } else {
      return multiplicationResult;
    }
  } else {
    return multiplicationResult;
  }
}
