/**
 * @typedef {OneHistogramAsBytesTransformFunctionArguments} OneHistogramAsBytesPerSecondTransformFunctionArguments
 */

/**
 * @param {OneHistogramTransformFunctionContext} context
 * @param {OneHistogramAsBytesTransformFunctionArguments} args
 * @returns {string|null|Array<string|null>}
 */
export default function asBytesPerSecond(context, args) {
  const data = context.evaluateTransformFunction(context, {
    functionName: 'asBytes',
    functionArguments: args,
  });
  const dataIsArray = Array.isArray(data);
  const dataAsArray = dataIsArray ? data : [data];

  const resultArray = dataAsArray.map((value) =>
    typeof value === 'string' ? `${value}ps` : null
  );

  return dataIsArray ? resultArray : resultArray[0];
}
