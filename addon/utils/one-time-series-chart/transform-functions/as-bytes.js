/**
 * A transform function, which calculates bytes size strings for
 * given bytes numbers.
 *
 * Arguments:
 * - `data` - must be of type:
 *     - number,
 *     - array of numbers,
 *     - transform function that will evaluate to one of above types.
 * - `format` - must be one of:
 *     - `'iec'`,
 *     - `'si'`,
 *     - `'bit'`,
 *     - transform function that will evaluate to one of above values.
 *
 * If some argument is a transform function, it is evaluated before further processing.
 *
 * In case of a single number in `data` the function will return a stringified size in bytes.
 * Example: `1024` -> `'1 KiB'`.
 * In case of an array of numbers in `data` the function will return an array with stringified
 * sizes in bytes for each number from the argument. Example:
 * `[1024, 2048]` -> `['1 KiB', '2 KiB']`.
 * In case of any non-number value (also in array), it will be converted to null.
 *
 * The format of stringified size can be adjusted using `format` argument. Default
 * format is `'iec'`. For more information about formatting see `bytes-to-string` util.
 *
 * @module utils/one-time-series-chart/transform-functions/as-bytes
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import bytesToString from 'onedata-gui-common/utils/bytes-to-string';

/**
 * @typedef {Object} OTSCAsBytesTransformFunctionArguments
 * @property {OTSCRawFunction|number|Array<number>} data
 * @property {OTSCRawFunction|AsBytesTransformFormat} format
 */

/**
 * @typedef {'si'|'iec'|'bit'} AsBytesTransformFormat
 */

export const possibleFormats = ['iec', 'si', 'bit'];

/**
 * @param {OTSCTransformFunctionContext} context
 * @param {OTSCAsBytesTransformFunctionArguments} args
 * @returns {string|null|Array<string|null>}
 */
export default function asBytes(context, args) {
  if (!args) {
    return null;
  }

  const data = context.evaluateTransformFunction(context, args.data);
  const dataIsArray = Array.isArray(data);
  const dataAsArray = dataIsArray ? data : [data];
  const format = context.evaluateTransformFunction(context, args.format);
  const normalizedFormat = possibleFormats.includes(format) ?
    format : possibleFormats[0];

  const resultArray = dataAsArray.map((value) =>
    Number.isFinite(value) ?
    bytesToString(value, { format: normalizedFormat }) :
    null
  );

  return dataIsArray ? resultArray : resultArray[0];
}
