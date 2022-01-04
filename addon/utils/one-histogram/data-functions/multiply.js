import { all as allFulfilled } from 'rsvp';
import _ from 'lodash';
import emptySeries from './empty-series';

/**
 * @typedef {Object} OneHistogramMultiplyDataFunctionArguments
 * @property {OneHistogramRawDataFunction[]} operands
 */

/**
 * @param {OneHistogramDataFunctionContext} context
 * @param {OneHistogramMultiplyDataFunctionArguments} args
 * @returns {Promise<Array<OneHistogramSeriesPoint[]>>}
 */
export default async function multiply(context, args) {
  const normalizedOperands = args && args.operands && args.operands.compact() || [];
  if (!normalizedOperands.length) {
    return emptySeries(context);
  }

  const evaluatedOperands = await allFulfilled(
    normalizedOperands.map(value => context.evaluateDataFunction(value, context))
  );

  const result = _.cloneDeep(evaluatedOperands[0]);
  evaluatedOperands.slice(1).forEach(operand => operand.forEach(({ value }, idx) =>
    result[idx].value *= value
  ));

  return result;
}
