/**
 * A series function, which replaces empty (null) values with provided ones.
 *
 * Arguments:
 * - `inputDataProvider` - must be a series function spec, which should evaluate
 *   to a function returning a number|point|null or an array of number|point|null.
 *   It is data, where empty (null) values should be replaced.
 * - `strategyProvider` - (optional) must be a series function spec, which should
 *   evaluate to a function returning OTSCReplaceEmptyTransformFunctionStrategy.
 *   Defines the way how empty values should be replaced. There are two possible
 *   modes: `useFallback` (default) and `usePrevious`
 * - `fallbackValueProvider` - must be a series function spec, which should
 *   evaluate to a function returning any value, an array of any values (also points).
 *   Provides values, which should be used to replace empty values loaded
 *   from `inputDataProvider`. How this argument will be used depends on strategy.
 *
 * This function is an extension of `replace-empty` transform function, so it works
 * exactly the same for single values and arrays of values. In case when
 * `inputDataProvider` evaluates to an array of points, then the result will
 * also be an array of points with untouched timestamps and replaced empty values.
 * For example for input:
 * ```
 * {
 *   inputDataProvider: {
 *     functionName: 'loadSeries',
 *     functionArguments: {
 *       // ... load series parameters, which usage would result in loading points:
 *       // [{ timestamp: 1, value: 4 }, { timestamp: 2, value: null }],
 *     },
 *   },
 *   strategyProvider: {
 *     functionName: 'literal',
 *     functionArguments: {
 *       data: 'useFallback',
 *     },
 *   },
 *   fallbackValueProvider: {
 *     functionName: 'literal',
 *     functionArguments: {
 *       data: 0,
 *     },
 *   },
 * }
 * ```
 * result will be: `[{ timestamp: 1, value: 4 }, { timestamp: 2, value: 0 }]`.
 *
 * Special cases in `useFallback` strategy:
 * - `inputDataProvider` returna a points array, `fallbackValueProvider`
 *   returns a simple values array -> points have empty values replaced
 *   element-wise. [arrays lengths must match]
 * - `inputDataProvider` and `fallbackValueProvider` both return points
 *   arrays -> as a fallback for each point from `inputDataProvider` a point
 *   from `fallbackValueProvider` with the same timestamp will be taken.
 *   Point will stay empty when fallback is not found.
 * - `inputDataProvider` returns a simple values array, `fallbackValueProvider`
 *   returns a points array -> `fallbackValueProvider` is converted to an array
 *   of points' values and then we have a case with two simple values arrays.
 *   [arrays lengths must match]
 * - `inputDataProvider` returns a single value, `fallbackValueProvider` returns
 *   a points array -> incorrect.
 * Other cases are already described in replace-empty transformation function.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { all as allFulfilled } from 'rsvp';
import mergePointsArrays from './utils/merge-points-arrays';

/**
 * @typedef {Object} OTSCReplaceEmptySeriesFunctionArguments
 * @property {OTSCRawFunction} inputDataProvider
 * @property {OTSCRawFunction} [strategyProvider]
 * @property {OTSCRawFunction} fallbackValueProvider
 */

/**
 * @typedef {OTSCReplaceEmptyTransformFunctionStrategy} OTSCReplaceEmptySeriesFunctionStrategy
 */

/**
 * @param {OTSCSeriesFunctionContext} context
 * @param {OTSCReplaceEmptySeriesFunctionArguments} args
 * @returns {Promise<OTSCSeriesFunctionGenericResult<Array<number|null>|number|null>>}
 */
export default async function multiply(context, args) {
  if (!args || !('inputDataProvider' in args) || !('fallbackValueProvider' in args)) {
    return {
      type: 'basic',
      data: null,
    };
  }

  const [data, strategy, fallbackValue] = await allFulfilled([
    context.evaluateSeriesFunction(context, args.inputDataProvider),
    context.evaluateSeriesFunction(context, args.strategyProvider),
    context.evaluateSeriesFunction(context, args.fallbackValueProvider),
  ]);

  let fallbackValueForTransform;
  if (fallbackValue.type === 'points') {
    if (data.type === 'points') {
      fallbackValueForTransform = [];
      let idxInFallback = 0;
      for (let i = 0; i < data.data.length; i++) {
        while (
          idxInFallback < fallbackValue.data.length &&
          fallbackValue.data[idxInFallback].timestamp < data.data[i].timestamp
        ) {
          idxInFallback++;
        }
        if (
          idxInFallback < fallbackValue.data.length &&
          fallbackValue.data[idxInFallback].timestamp === data.data[i].timestamp
        ) {
          fallbackValueForTransform.push(fallbackValue.data[idxInFallback].value);
        } else {
          fallbackValueForTransform.push(null);
        }
      }
    } else {
      fallbackValueForTransform = fallbackValue.data.mapBy('value');
    }
  } else {
    fallbackValueForTransform = fallbackValue.data;
  }

  const valuesAfterReplace = context.evaluateTransformFunction(null, {
    functionName: 'replaceEmpty',
    functionArguments: {
      inputDataProvider: {
        functionName: 'literal',
        functionArguments: {
          data: data.type === 'points' ? data.data.mapBy('value') : data.data,
        },
      },
      strategyProvider: {
        functionName: 'literal',
        functionArguments: {
          data: strategy.data,
        },
      },
      fallbackValueProvider: {
        functionName: 'literal',
        functionArguments: {
          data: fallbackValueForTransform,
        },
      },
    },
  });

  if (data.type === 'points' && valuesAfterReplace !== null) {
    return {
      type: 'points',
      data: mergePointsArrays([data.data], valuesAfterReplace),
    };
  } else {
    return {
      type: 'basic',
      data: valuesAfterReplace,
    };
  }
}
