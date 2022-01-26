/**
 * A series function, which loads series from the source specified by arguments.
 *
 * Arguments:
 * - sourceType - one of `'empty'`, `'externalSource'`
 * - sourceParameters - additional parameters specific for each source type.
 *
 * For `externalSource` type `sourceParameters` are:
 * - externalSourceName - name of an external source, which is able to provide series data.
 * - externalSourceParameters - additional parameters, that should be passed to the
 *   external source described by `externalSourceName` during data fetching.
 *
 * External source must provide method `fetchSeries`, which will be called by this
 * series function to obtain data. That method will be invoked with arguments:
 * - `{ lastWindowTimestamp, timeResolution, windowsCount }`,
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

/**
 * @typedef {OTSCExternalDataSourceRef} OTSCLoadSeriesSeriesFunctionArguments
 */

/**
 * @param {OTSCSeriesFunctionContext} context
 * @param {OTSCLoadSeriesSeriesFunctionArguments} args
 * @returns {Promise<OTSCSeriesFunctionPointsResult>}
 */
export default async function loadSeries(context, args) {
  if (!context.timeResolution || !context.windowsCount || !args) {
    return {
      type: 'points',
      data: [],
    };
  }

  const [
    { data: sourceType },
    { data: sourceParameters },
  ] = await allFulfilled([
    context.evaluateSeriesFunction(context, args.sourceType),
    context.evaluateSeriesFunction(context, args.sourceParameters),
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
          lastWindowTimestamp: context.lastWindowTimestamp,
          timeResolution: context.timeResolution,
          // fetching one additional window to check whether end of series
          // has been reached
          windowsCount: context.windowsCount + 1,
        };
        const rawPoints = await externalDataSource.fetchSeries(
          fetchParams,
          sourceParameters.externalSourceParameters
        );
        points = fitPointsToContext(context, rawPoints);
      }
      break;
    }
    case 'empty':
      points = generateFakePoints(context, generateLastWindowTimestamp(context), {
        newest: true,
        oldest: true,
      });
      break;
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
 *
 * @param {OTSCSeriesFunctionContext} context
 * @param {OTSCSeriesPoint[]} points
 */
function fitPointsToContext(context, points) {
  if (!isRawPointsArray(points)) {
    return [];
  }
  // Sort by timestamp descending and create full points objects
  let normalizedPoints = points
    .sortBy('timestamp')
    .reverse()
    .map(({ timestamp, value }) => point(timestamp, value));

  // Remove points newer than context.lastWindowTimestamp
  if (context.lastWindowTimestamp) {
    normalizedPoints = normalizedPoints.filter(({ timestamp }) =>
      timestamp <= context.lastWindowTimestamp
    );
  }

  const isLastWindowNewest = !context.lastWindowTimestamp ||
    (context.nowTimestamp - context.lastWindowTimestamp) < context.timeResolution;

  // Find out timestamp of globally oldest point
  let globallyOldestPointTimestamp = null;
  if (normalizedPoints.length && normalizedPoints.length < context.windowsCount + 1) {
    globallyOldestPointTimestamp = normalizedPoints[normalizedPoints.length - 1].timestamp;
  }

  // Remove points, that do not describe times matching context.timeResolution
  normalizedPoints = normalizedPoints.filter(({ timestamp }) =>
    timestamp % context.timeResolution === 0
  );

  // If there are no points, return fake ones
  if (!normalizedPoints.length) {
    if (context.lastWindowTimestamp) {
      return generateFakePoints(context, context.lastWindowTimestamp, {
        oldest: true,
        newest: isLastWindowNewest,
      });
    } else {
      return [];
    }
  }

  // Cut off extra window (added to check for existence of older points)
  if (normalizedPoints.length > context.windowsCount) {
    normalizedPoints = normalizedPoints.slice(0, context.windowsCount);
  }

  // Add missing points after (newer than) received points
  if (
    context.lastWindowTimestamp &&
    context.lastWindowTimestamp - context.timeResolution >= normalizedPoints[0].timestamp
  ) {
    const missingSeconds = context.lastWindowTimestamp - normalizedPoints[0].timestamp;
    const normalizedMissingSeconds = missingSeconds - (missingSeconds % context.timeResolution);
    let nextFakePointTimestamp = normalizedPoints[0].timestamp + normalizedMissingSeconds;
    const pointsToUnshift = [];
    while (
      nextFakePointTimestamp > normalizedPoints[0].timestamp &&
      pointsToUnshift.length < context.windowsCount
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
  while (normalizedPoints.length < context.windowsCount) {
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

  // Flag newest points
  if (isLastWindowNewest) {
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

function generateFakePoints(context, lastWindowTimestamp, pointParams = {}) {
  const normalizedLastWindowTimestamp = lastWindowTimestamp -
    (lastWindowTimestamp % context.timeResolution);
  const points = fitPointsToContext(context, [point(normalizedLastWindowTimestamp, null)]);
  points.forEach((point) => Object.assign(point, { fake: true }, pointParams));
  return points;
}

function generateLastWindowTimestamp(context) {
  return context.lastWindowTimestamp ||
    context.nowTimestamp ||
    Math.floor(Date.now() / 1000);
}
