/**
 * A series function, which calculates a rate value for given input. Rate is a
 * value-per-time data, which is calculated like this:
 * ```
 * rate = (value / timeResolution) * timeSpan.
 * ```
 * `timeSpan`, when not provided, defaults to 1 (so rate is "per one second").
 * Arguments:
 * - `inputDataProvider` - must be a series function spec, which should evaluate
 *   to a function returning a number, an array of numbers or an array of points.
 * - `timeSpanProvider` - (optional) must be a series function spec,
 *   which should evaluate to a function returning a number.
 *
 * Example:
 * Assuming `timeResolution = 5` for input (after providers evaluation)
 * ```
 * [{ timestamp: 0, value: 100 }, { timestamp: 5, value: 200 }]
 * ```
 * and default `timeSpan` it returns
 * ```
 * [{ timestamp: 0, value: 20 }, { timestamp: 5, value: 40 }]
 * ```
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { all as allFulfilled } from 'rsvp';
import _ from 'lodash';

/**
 * @typedef {Object} OTSCRateSeriesFunctionArguments
 * @property {OTSCRawFunction} inputDataProvider
 * @property {OTSCRawFunction} [timeSpanProvider]
 */

/**
 * @type {OTSCSeriesFunctionBasicResult<number>}
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

  const [
    inputData,
    { data: timeSpan },
  ] = await allFulfilled([
    context.evaluateSeriesFunction(context, args.inputDataProvider),
    context.evaluateSeriesFunction(context, args.timeSpanProvider)
    .then((timeSpanArg) => normalizeTimeSpanArg(timeSpanArg)),
  ]);

  const inputDataIsArray = Array.isArray(inputData.data);
  const inputDataAsArray = inputDataIsArray ? inputData.data : [inputData.data];
  const numericInputData = inputData?.type === 'points' ?
    inputDataAsArray.map((point) => point?.value ?? null) : inputDataAsArray;
  const numericResultData = [];

  for (let i = 0; i < numericInputData.length; i++) {
    const value = numericInputData[i];

    if (!Number.isFinite(value)) {
      numericResultData.push(null);
      continue;
    }

    let measurementDuration = inputData?.type === 'points' &&
      inputDataAsArray[i]?.measurementDuration;
    if (!measurementDuration) {
      measurementDuration = context.timeResolution;
    }

    numericResultData.push((value / measurementDuration) * timeSpan);
  }

  if (inputData.type === 'points') {
    const result = _.cloneDeep(inputData);
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
