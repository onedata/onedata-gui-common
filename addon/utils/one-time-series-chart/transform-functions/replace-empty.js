/**
 * A transform function, which replaces empty (null) values with provided ones.
 *
 * Arguments:
 * - `data` - can be any value, array of values or a transform function,
 *     that will be evaluated. It is data, where empty values should be replaced.
 * - `fallbackValue` - can be any value, array of values or a transform function,
 *     that will be evaluated. Provides values, which should be used to replace
 *     empty values in `data`.
 *
 * If both - `data` and `fallbackValue` - evaluate to arrays, then empty values
 * substitution will be performed element-wise. Hence lengths of these arrays
 * must match.
 *
 * If `data` is an array and `fallbackValue` is a single value, then all empty
 * values in `data` will be replaced with the same value.
 *
 * When both - `data` and `fallbackValue` - evaluate to single values, then an
 * empty value substitution is obvious.
 *
 * Situation, when `data` is a single value and `fallbackValue` is an array is
 * invalid.
 *
 * @module utils/one-time-series-chart/transform-functions/replace-empty
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import _ from 'lodash';

/**
 * @typedef {Object} OTSCReplaceEmptyTransformFunctionArguments
 * @property {Array<OTSCRawFunction|Array<unknown|null>|unknown|null>} data
 * @property {Array<OTSCRawFunction|Array<unknown|null>|unknown|null>} fallbackValue
 */

/**
 * @param {OTSCTransformFunctionContext} context
 * @param {OTSCReplaceEmptyTransformFunctionArguments} args
 * @returns {Array<unknown|null>|unknown|null}
 */
export default function replaceEmpty(context, args) {
  if (!args || !('data' in args) || !('fallbackValue' in args)) {
    return null;
  }

  const data = context.evaluateTransformFunction(context, args.data);
  const fallbackValue = context.evaluateTransformFunction(context, args.fallbackValue);

  if (Array.isArray(data)) {
    if (Array.isArray(fallbackValue)) {
      // Incorrect arguments
      if (data.length !== fallbackValue.length) {
        return null;
      }
      return performNullsReplacement(data, fallbackValue);
    } else {
      const fallbackValues = _.times(data.length, _.constant(fallbackValue));
      return performNullsReplacement(data, fallbackValues);
    }
  } else {
    // Incorrect arguments
    if (Array.isArray(fallbackValue)) {
      return null;
    } else {
      return data === null ? fallbackValue : data;
    }
  }
}

function performNullsReplacement(source, fallbackValues) {
  return source.map((value, idx) => value === null ? fallbackValues[idx] : value);
}
