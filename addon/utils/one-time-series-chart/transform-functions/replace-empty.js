/**
 * A transform function, which replaces empty (null) values according to passed strategy.
 *
 * Arguments:
 * - `inputDataProvider` - must be a transform function spec, which should evaluate
 *   to a function returning a number|null or an array of number|null. It is data,
 *   where empty (null) values should be replaced.
 * - `strategyProvider` - (optional) must be a transform function spec, which should
 *   evaluate to a function returning OTSCReplaceEmptyTransformFunctionStrategy.
 *   Defines the way how empty values should be replaced. There are two possible
 *   modes: `useFallback` (default) and `usePrevious`
 * - `fallbackValueProvider` - must be a transform function spec, which should
 *   evaluate to a function returning any value or an array of any values.
 *   Provides values, which should be used to replace empty values loaded
 *   from `inputDataProvider`. How this argument will be used depends on strategy.
 *
 * When strategy is `useFallback` then `fallbackValueProvider` provides a source
 * of replacements for empty values in data from `inputDataProvider`.
 * - If both - `inputDataProvider` and `fallbackValueProvider` - return arrays,
 *   then empty values substitution will be performed element-wise.
 *   Hence lengths of these arrays must match.
 * - If `inputDataProvider` returns an array and `fallbackValuePovider` returns
 *   a single value, then all empty values in `data` will be replaced with
 *   the same value.
 * - When both - `inputDataProvider` and `fallbackValueProvider` - evaluate to
 *   single values, then an empty value substitution is obvious.
 *
 * When strategy is `usePrevious` then it replaces empty values with the closest
 * previous non-empty value from `inputDataProvider`. If there is no such previous
 * value, then `useFallback` strategy is used. Example:
 * Input:
 * ```
 * {
 *   inputDataProvider: {
 *     functionName: 'literal',
 *     functionArguments: {
 *       data: [null, null, 1, null, null, 2, null],
 *     },
 *   },
 *   strategyProvider: {
 *     functionName: 'literal',
 *     functionArguments: {
 *       data: 'usePrevious',
 *     },
 *   },
 *   fallbackValueProvider: {
 *     functionName: 'literal',
 *     functionArguments: {
 *       data: 100,
 *     },
 *   },
 * }
 * ```
 * Output: `[100, 100, 1, 1, 1, 2, 2]`
 *
 * Situation, when `inputDataProvider` evaluates to a single value and
 * `fallbackValueProvider` evaluates to an array is invalid.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import _ from 'lodash';

/**
 * @typedef {Object} OTSCReplaceEmptyTransformFunctionArguments
 * @property {OTSCRawFunction} inputDataProvider
 * @property {OTSCRawFunction} [strategyProvider]
 * @property {OTSCRawFunction} fallbackValueProvider
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
