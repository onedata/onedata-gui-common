/**
 * @typedef {Object} OneHistogramSupplyValueTransformFunctionArguments
 */

/**
 * @param {OneHistogramTransformFunctionContext} context
 * @param {OneHistogramSupplyValueTransformFunctionArguments} args
 * @returns {unknown}
 */
export default function abs(context /**, args */ ) {
  return 'valueToSupply' in context ? context.valueToSupply : null;
}
