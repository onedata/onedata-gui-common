/**
 * A transform function, which calculates "bytes per second"-formatted strings for
 * given bytes numbers.
 *
 * It takes the same arguments and has the same results as `as-bytes` transform
 * function except that each result has additional `ps` suffix at the end.
 *
 * @module utils/one-histogram/transform-functions/as-bytes-per-second
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

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
