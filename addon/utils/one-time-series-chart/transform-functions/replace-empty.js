/**
 * A transform function, which replaces empty (null) values according to passed strategy.
 *
 * Arguments:
 * - `data` - can be any value, array of values or a transform function,
 *   that will be evaluated. It is data, where empty values should be replaced.
 * - `strategy` - (optional) defines the way how empty values should be replaced.
 *   There are two possible modes: `useFallback` (default) and `usePrevious`
 * - `fallbackValue` - can be any value, array of values or a transform function,
 *   that will be evaluated. Provides values, which should be used to replace
 *   empty values in `data`. How this argument will be used depends on strategy.
 *
 * When strategy is `useFallback` then `fallbackValue` is a source of replacements for
 * empty values in `data`.
 * - If both - `data` and `fallbackValue` - evaluate to arrays, then empty values
 *   substitution will be performed element-wise. Hence lengths of these arrays
 *   must match.
 * - If `data` is an array and `fallbackValue` is a single value, then all empty
 *   values in `data` will be replaced with the same value.
 * - When both - `data` and `fallbackValue` - evaluate to single values, then an
 *   empty value substitution is obvious.
 *
 * When strategy is `usePrevious` then it replaces empty values with the closest
 * previous non-empty value from `data`. If there is no such previous value, then
 * `useFallback` strategy is used. Example:
 * Input:
 * ```
 * {
 *   data: [null, null, 1, null, null, 2, null],
 *   strategy: 'usePrevious',
 *   fallbackValue: 100,
 * }
 * ```
 * Output: `[100, 100, 1, 1, 1, 2, 2]`
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
 * @property {OTSCRawFunction|Array<unknown|null>|unknown|null} data
 * @property {OTSCRawFunction|OTSCReplaceEmptyTransformFunctionStrategy} [strategy]
 * @property {OTSCRawFunction|Array<unknown|null>|unknown|null} fallbackValue
 */

/**
 * @typedef {'useFallback'|'usePrevious'} OTSCReplaceEmptyTransformFunctionStrategy
 */

/**
 * @param {OTSCTransformFunctionContext} context
 * @param {OTSCReplaceEmptyTransformFunctionArguments} args
 * @returns {Array<unknown|null>|unknown|null}
 */
export default function replaceEmpty(context, args) {
  if (!args || !('inputDataProvider' in args) || !('fallbackValueProvider' in args)) {
    return null;
  }

  const data = context.evaluateTransformFunction(context, args.inputDataProvider);
  const strategy = normalizeStrategy(
    context.evaluateTransformFunction(context, args.strategyProvider)
  );
  const fallbackValue =
    context.evaluateTransformFunction(context, args.fallbackValueProvider);

  if (Array.isArray(data)) {
    let normalizedFallbackValues;
    if (Array.isArray(fallbackValue)) {
      // Incorrect arguments
      if (data.length !== fallbackValue.length) {
        return null;
      }
      normalizedFallbackValues = fallbackValue;
    } else {
      normalizedFallbackValues = _.times(data.length, _.constant(fallbackValue));
    }
    return performNullsReplacement(data, strategy, normalizedFallbackValues);
  } else {
    // Incorrect arguments
    if (Array.isArray(fallbackValue)) {
      return null;
    } else {
      return data === null ? fallbackValue : data;
    }
  }
}

function normalizeStrategy(strategy) {
  if (strategy === 'useFallback' || strategy === 'usePrevious') {
    return strategy;
  } else {
    return 'useFallback';
  }
}

function performNullsReplacement(source, strategy, fallbackValues) {
  const result = [];
  for (let i = 0; i < source.length; i++) {
    if (source[i] !== null) {
      result.push(source[i]);
    } else if (strategy === 'usePrevious' && i > 0 && result[i - 1] !== null) {
      result.push(result[i - 1]);
    } else {
      result.push(fallbackValues[i]);
    }
  }
  return result;
}
