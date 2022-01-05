/**
 * @typedef {Object} OneHistogramAbsTransformFunctionArguments
 * @property {OneHistogramRawFunction|number|Array<number>} data
 */

/**
 * @param {OneHistogramTransformFunctionContext} context
 * @param {OneHistogramAbsTransformFunctionArguments} args
 * @returns {number|null|Array<number|null>}
 */
export default function abs(context, args) {
  if (!args) {
    return null;
  }

  const data = context.evaluateTransformFunction(context, args.data);
  const dataIsArray = Array.isArray(data);
  const dataAsArray = dataIsArray ? data : [data];

  const resultArray = dataAsArray.map((value) =>
    Number.isFinite(value) ? Math.abs(value) : null
  );

  return dataIsArray ? resultArray : resultArray[0];
}
