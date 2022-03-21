/**
 * A series function, which loads series from the source specified by arguments.
 *
 * Arguments:
 * - sourceType - for now only `'external'` is available
 * - sourceParameters - additional parameters specific for each source type.
 * - replaceEmptyOptions - specifies how empty points should be filled with values.
 *   Contains two fields: `strategy`, and `fallbackValue`. Read more about them in
 *   `replaceEmpty` transform function documentation. When not provided it equals to:
 *   `{ strategy: 'useFallback', fallbackValue: 0 }`.
 *
 * For `externalSource` type `sourceParameters` are:
 * - externalSourceName - name of an external source, which is able to provide series data.
 * - externalSourceParameters - additional parameters, that should be passed to the
 *   external source described by `externalSourceName` during data fetching.
 *
 * External source must provide method `fetchSeries`, which will be called by this
 * series function to obtain data. That method will be invoked with arguments:
 * - `{ lastPointTimestamp, timeResolution, pointsCount }`,
 * - `externalSourceParameters`.
 * Using these arguments external source should return a promise, which will eventually
 * resolve to an array of points.
 *
 * @module utils/one-time-series-chart/series-functions/load-series
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { all as allFulfilled } from 'rsvp';
import point from './utils/point';
import mergePointsArrays from './utils/merge-points-arrays';

/**
 * @typedef {OTSCExternalDataSourceRef} OTSCLoadSeriesSeriesFunctionArguments
 * @typedef {OTSCLoadSeriesSeriesFunctionReplaceEmptyOptions} [replaceEmptyOptions]
 */

/**
 * @typedef {Object} OTSCLoadSeriesSeriesFunctionReplaceEmptyOptions
 * @property {OTSCReplaceEmptySeriesFunctionStrategy} [strategy]
 * @property {Array<unknown|null>|unknown|null} fallbackValue
 */

const defaultReplaceEmptyOptionsArg = {
  type: 'basic',
  data: {
    strategy: 'useFallback',
    fallbackValue: null,
  },
};

/**
 * @param {OTSCSeriesFunctionContext} context
 * @param {OTSCLoadSeriesSeriesFunctionArguments} args
 * @returns {Promise<OTSCSeriesFunctionPointsResult>}
 */
export default async function loadSeries(context, args) {
  if (!context.timeResolution || !context.pointsCount || !args) {
    return {
      type: 'points',
      data: [],
    };
  }

  const [
    { data: sourceType },
    { data: sourceParameters },
    { data: replaceEmptyOptions },
  ] = await allFulfilled([
    context.evaluateSeriesFunction(context, args.sourceType),
    context.evaluateSeriesFunction(context, args.sourceParameters),
    context.evaluateSeriesFunction(context, args.replaceEmptyOptions)
    .then((replaceEmptyOptionsArg) => normalizeReplaceEmptyOptionsArg(replaceEmptyOptionsArg)),
  ]);

  let points;
  switch (sourceType) {
    case 'external': {
      const externalDataSource =
        context.externalDataSources[sourceParameters.externalSourceName];
      if (!externalDataSource) {
        points = [];
      } else {
        const fetchParams = {
          lastPointTimestamp: context.lastPointTimestamp,
          timeResolution: context.timeResolution,
          // fetching one additional point to check whether end of series
          // has been reached
          pointsCount: context.pointsCount + 1,
        };
        const rawPoints = await externalDataSource.fetchSeries(
          fetchParams,
          sourceParameters.externalSourceParameters
        );
        points = await fitPointsToContext(context, replaceEmptyOptions, rawPoints);
      }
      break;
    }
    default:
      points = [];
      break;
  }
  return {
    type: 'points',
    data: points,
  };
}

/**
 * @param {OTSCSeriesFunctionContext} context
 * @param {OTSCLoadSeriesSeriesFunctionReplaceEmpty} replaceEmptyOptions
 * @param {OTSCSeriesPoint[]} points
 */
async function fitPointsToContext(context, replaceEmptyOptions, points) {
  if (!isRawPointsArray(points)) {
    return [];
  }
  // Sort by timestamp descending and create full points objects
  let normalizedPoints = points
    .sortBy('timestamp')
    .reverse()
    .map(({ timestamp, value }) => point(timestamp, value));

  // Remove points newer than context.lastPointTimestamp
  if (context.lastPointTimestamp) {
    normalizedPoints = normalizedPoints.filter(({ timestamp }) =>
      timestamp <= context.lastPointTimestamp
    );
  }

  const isLastPointNewest = !context.lastPointTimestamp ||
    (context.nowTimestamp - context.lastPointTimestamp) < context.timeResolution;

  // Find out timestamp of globally oldest point
  let globallyOldestPointTimestamp = null;
  if (normalizedPoints.length && normalizedPoints.length < context.pointsCount + 1) {
    globallyOldestPointTimestamp = normalizedPoints[normalizedPoints.length - 1].timestamp;
  }

  // Remove points, that do not describe times matching context.timeResolution
  normalizedPoints = normalizedPoints.filter(({ timestamp }) =>
    timestamp % context.timeResolution === 0
  );

  // If there are no points, return fake ones
  if (!normalizedPoints.length) {
    if (context.lastPointTimestamp) {
      return await generateFakePoints(
        context,
        context.lastPointTimestamp,
        replaceEmptyOptions, {
          oldest: true,
          newest: isLastPointNewest,
        });
    } else {
      return [];
    }
  }

  // Add missing points after (newer than) received points
  if (
    context.lastPointTimestamp &&
    context.lastPointTimestamp - context.timeResolution >= normalizedPoints[0].timestamp
  ) {
    const missingSeconds = context.lastPointTimestamp - normalizedPoints[0].timestamp;
    const normalizedMissingSeconds = missingSeconds - (missingSeconds % context.timeResolution);
    let nextFakePointTimestamp = normalizedPoints[0].timestamp + normalizedMissingSeconds;
    const pointsToUnshift = [];
    while (
      nextFakePointTimestamp > normalizedPoints[0].timestamp &&
      pointsToUnshift.length < context.pointsCount
    ) {
      pointsToUnshift.push(point(nextFakePointTimestamp, null, { fake: true }));
      nextFakePointTimestamp -= context.timeResolution;
    }
    normalizedPoints = [...pointsToUnshift, ...normalizedPoints];
  }

  // Add missing points between and before received points
  const normalizedPointsWithGaps = normalizedPoints;
  normalizedPoints = [];
  let nextPointTimestamp = normalizedPointsWithGaps[0].timestamp;
  let originArrayIdx = 0;
  while (normalizedPoints.length < context.pointsCount) {
    if (
      originArrayIdx < normalizedPointsWithGaps.length &&
      normalizedPointsWithGaps[originArrayIdx].timestamp === nextPointTimestamp
    ) {
      normalizedPoints.push(normalizedPointsWithGaps[originArrayIdx]);
      originArrayIdx++;
    } else {
      normalizedPoints.push(point(nextPointTimestamp, null, { fake: true }));
    }
    nextPointTimestamp -= context.timeResolution;
  }

  // Calculate replacements for points with `null` value.
  //
  // In case of `usePrevious` replacement strategy we need to provide one more
  // point to `replaceEmpty` function to be able to calculate value for the oldest
  // point visible on the chart.
  const oldestNormalizedPoint = normalizedPoints[normalizedPoints.length - 1];
  let nonEmptyPointBeforeOldestNormalized = { timestamp: 0, value: null };
  for (const point of normalizedPointsWithGaps) {
    if (
      point.timestamp < oldestNormalizedPoint.timestamp &&
      point.value !== null
    ) {
      nonEmptyPointBeforeOldestNormalized = point;
      break;
    }
  }
  normalizedPoints = (await replaceEmpty(
    context,
    replaceEmptyOptions,
    [...normalizedPoints, nonEmptyPointBeforeOldestNormalized].reverse()
  )).reverse().slice(0, -1);

  // Flag newest points
  if (isLastPointNewest) {
    let realPointFlaggedAsNewest = false;
    for (let i = 0; i < normalizedPoints.length && !realPointFlaggedAsNewest; i++) {
      if (!normalizedPoints[i].fake) {
        realPointFlaggedAsNewest = true;
      }
      normalizedPoints[i].newest = true;
    }
  }

  // Sort by timestamp ascending
  normalizedPoints = normalizedPoints.reverse();

  // Flag oldest points
  if (globallyOldestPointTimestamp !== null) {
    for (let i = 0; i < normalizedPoints.length; i++) {
      if (normalizedPoints[i].timestamp > globallyOldestPointTimestamp) {
        break;
      }
      normalizedPoints[i].oldest = true;
    }
  }

  return normalizedPoints;
}

function isRawPointsArray(pointsArray) {
  return Array.isArray(pointsArray) && pointsArray.every(point =>
    point && typeof point === 'object' && 'timestamp' in point && 'value' in point
  );
}

async function generateFakePoints(context, lastPointTimestamp, replaceEmptyOptions, pointParams = {}) {
  const normalizedLastPointTimestamp = lastPointTimestamp -
    (lastPointTimestamp % context.timeResolution);
  const points = await fitPointsToContext(
    context,
    replaceEmptyOptions,
    [point(normalizedLastPointTimestamp, null)]
  );
  points.forEach((point) => Object.assign(point, { fake: true }, pointParams));
  return points;
}

async function replaceEmpty(context, replaceEmptyOptions, points) {
  const valuesAfterReplacement = await context.evaluateTransformFunction(context, {
    functionName: 'replaceEmpty',
    functionArguments: Object.assign({}, replaceEmptyOptions, {
      data: points.map(({ value }) => value),
    }),
  });
  return mergePointsArrays([points], valuesAfterReplacement);
}

function normalizeReplaceEmptyOptionsArg(replaceEmptyOptionsArg) {
  if (
    !replaceEmptyOptionsArg ||
    replaceEmptyOptionsArg.type !== 'basic' ||
    !replaceEmptyOptionsArg.data
  ) {
    return defaultReplaceEmptyOptionsArg;
  }
  return replaceEmptyOptionsArg;
}
