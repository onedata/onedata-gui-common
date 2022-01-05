import bytesToString from 'onedata-gui-common/utils/bytes-to-string';

/**
 * @typedef {Object} OneHistogramAsBytesTransformFunctionArguments
 * @property {OneHistogramRawFunction|number|Array<number>} data
 * @property {OneHistogramRawFunction|AsBytesTransformFormat} format
 */

/**
 * @typedef {'si'|'iec'|'bit'} AsBytesTransformFormat
 */

export const possibleFormats = ['iec', 'si', 'bit'];

/**
 * @param {OneHistogramTransformFunctionContext} context
 * @param {OneHistogramAsBytesTransformFunctionArguments} args
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
