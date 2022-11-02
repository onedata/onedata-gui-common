/**
 * A series function, which calculates a time derivative for given input. It is a
 * value-per-time data, which is calculated like this:
 * ```
 * timeDerivative = ((value2 - value1) / timeResolution) * timeSpan.
 * ```
 * `value1` and `value2` are two consecutive values from input data.
 * `timeSpan`, when not provided, defaults to 1 (so rate is "per one second").
 * Arguments:
 * - `inputDataProvider` - must be a series function spec, which should evaluate
 *   to a function returning a number, an array of numbers or an array of points.
 * - `timeSpanProvider` - (optional) must be a series function spec,
 *   which should evaluate to a function returning a number.
 *
 * Example:
 * For input (after providers evaluation)
 * ```
 * [{ timestamp: 0, value: 100 }, { timestamp: 5, value: 200 }, { timestamp: 10, value: 50 }]
 * ```
 * and default `timeSpan` it returns
 * ```
 * [{ timestamp: 5, value: 20 }, { timestamp: 10, value: -30 }]
 * ```
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { all as allFulfilled } from 'rsvp';
import _ from 'lodash';

/**
 * @typedef {Object} OTSCTimeDerivativeSeriesFunctionArguments
 * @property {OTSCRawFunction} inputDataProvider
 * @property {OTSCRawFunction} [timeSpanProvider]
 */

const defaultTimeSpanArg = {
  type: 'basic',
  data: 1,
};

/**
 * @param {OTSCSeriesFunctionContext} context
 * @param {OTSCRateSeriesFunctionArguments} args
 * @returns {Promise<OTSCSeriesFunctionGenericResult<Array<number|null>|number|null>>}
 */
export default async function rate(context, args) {
  if (!args || !args.inputDataProvider) {
    return {
      type: 'basic',
      data: null,
    };
  }

  const contextForInputData =
    Object.assign({}, context, { pointsCount: context.pointsCount + 1 });
  const [
    inputData,
    { data: timeSpan },
  ] = await allFulfilled([
    context.evaluateSeriesFunction(contextForInputData, args.inputDataProvider),
    context.evaluateSeriesFunction(context, args.timeSpanProvider)
    .then((timeSpanArg) => normalizeTimeSpanArg(timeSpanArg)),
  ]);

  const inputDataIsArray = Array.isArray(inputData.data);
  const inputDataAsArray = inputDataIsArray ? inputData.data : [inputData.data];
  const numericInputData = inputData?.type === 'points' ?
    inputDataAsArray.map((point) => point?.value ?? null) : inputDataAsArray;
  const numericResultData = [];

  for (let i = 0; i < numericInputData.length - 1; i++) {
    let thisValue = numericInputData[i];
    const nextValue = numericInputData[i + 1];
    // If i-th value is from an empty fake point before the oldest point
    if (
      thisValue === null &&
      inputData?.type === 'points' &&
      inputDataAsArray[i + 1]?.oldest &&
      !inputDataAsArray[i + 1]?.fake
    ) {
      thisValue = 0;
    }
    if (!Number.isFinite(thisValue) || !Number.isFinite(nextValue)) {
      numericResultData.push(null);
    } else {
      const delta = nextValue - thisValue;
      numericResultData.push((delta / context.timeResolution) * timeSpan);
    }
  }

  if (inputData.type === 'points') {
    const result =
      _.cloneDeep(Object.assign({}, inputData, { data: inputData.data.slice(1) }));
    result.data.forEach((point, idx) => point.value = numericResultData[idx]);
    return result;
  } else {
    return {
      type: 'basic',
      data: inputDataIsArray ? numericResultData : (numericResultData[0] ?? null),
    };
  }
}

function normalizeTimeSpanArg(timeSpanArg) {
  let timeSpanCandidate = null;
  if (
    timeSpanArg?.type === 'points' &&
    timeSpanArg?.data?.length
  ) {
    timeSpanCandidate = timeSpanArg.data[timeSpanArg.data.length - 1]?.value;
  } else if (timeSpanArg?.type === 'basic') {
    timeSpanCandidate = timeSpanArg.data;
  } else {
    return defaultTimeSpanArg;
  }

  return (Number.isFinite(timeSpanCandidate) && timeSpanCandidate > 0) ? {
    type: 'basic',
    data: timeSpanCandidate,
  } : defaultTimeSpanArg;
}
