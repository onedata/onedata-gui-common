/**
 * A transform function, which calculates an absolute value of given numbers.
 *
 * Arguments:
 * - `data` - must be of type:
 *     - number,
 *     - array of numbers,
 *     - transform function that will evaluate to one of above types.
 *
 * If `data` is a transform function, it is evaluated before further processing.
 *
 * In case of a single number the function will return an absolute value of that number.
 * Example: `-6` -> `6`.
 * In case of an array of numbers the function will return an array with absolute
 * values for each number from the argument. Example: `[1, -2]` -> `[1, 2]`.
 * In case of any non-number value (also in array), it will be converted to null.
 *
 * @module utils/one-time-series-chart/transform-functions/abs
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/**
 * @typedef {Object} OTSCAbsTransformFunctionArguments
 * @property {OTSCRawFunction|Array<number|null>|number|null} data
 */

/**
 * @param {OTSCTransformFunctionContext} context
 * @param {OTSCAbsTransformFunctionArguments} args
 * @returns {Array<number|null>|number|null}
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
