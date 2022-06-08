/**
 * A series function, which replaces empty (null) values with provided ones.
 *
 * Arguments:
 * - `data` - can be a single value, array of values, array of points or a series
 *   function, that will be evaluated. It is data, where empty values should
 *   be replaced.
 * - `strategy` - (optional) defines the way how empty values should be replaced.
 *   There are two possible modes: `useFallback` (default) and `usePrevious`
 * - `fallbackValue` - can be any value, array of values, array of points or
 *   a series function, that will be evaluated. Provides values, which should
 *   be used to replace empty values in `data`.
 *
 * This function is an extension of `replace-empty` transform function, so it works
 * exactly the same for single values and arrays of values. In case when `data`
 * is an array of points, then the result will also be an array of points
 * with untouched timestamps and replaced empty values. For example for input:
 * ```
 * {
 *   data: [{ timestamp: 1, value: 4 }, { timestamp: 2, value: null }],
 *   strategy: 'useFallback',
 *   fallbackValue: 0
 * }
 * ```
 * result will be: `[{ timestamp: 1, value: 4 }, { timestamp: 2, value: 0 }]`.
 *
 * Special cases in `useFallback` strategy:
 * - `data` is a points array, `fallbackValue` is a simple values array -> points have
 *   empty values replaced element-wise. [arrays lengths must match]
 * - `data` and `fallbackValue` are both points arrays -> as a fallback for each point
 *   from `data` a point from `fallbackValue` with the same timestamp will be taken.
 *   Point will stay empty when fallback is not found.
 * - `data` is a simple values array, `fallbackValue` is a points array -> `fallbackValue`
 *   is converted to an array of points values and then we have a case with two
 *   simple values arrays. [arrays lengths must match]
 * - `data` is a single value, `fallbackValue` is a points array -> incorrect
 * Other cases are already described in replace-empty transformation function.
 *
 * @module utils/one-time-series-chart/series-functions/replace-empty
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { all as allFulfilled } from 'rsvp';
import mergePointsArrays from './utils/merge-points-arrays';

/**
 * @typedef {Object} OTSCReplaceEmptySeriesFunctionArguments
 * @property {OTSCRawFunction|Array<unknown|null>|unknown|null} data
 * @property {OTSCRawFunction|OTSCReplaceEmptySeriesFunctionStrategy} [strategy]
 * @property {OTSCRawFunction|Array<unknown|null>|unknown|null} fallbackValue
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
