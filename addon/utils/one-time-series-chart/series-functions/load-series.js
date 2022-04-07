// TODO: VFS-9257 fix eslint issues in this file
/* eslint-disable valid-jsdoc */
/* eslint-disable max-len */

/**
 * A series function, which loads series from the source specified by arguments.
 *
 * Arguments:
 * - sourceType - for now only `'external'` is available
 * - sourceParameters - additional parameters specific for each source type.
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

/**
 * @typedef {OTSCExternalDataSourceRef} OTSCLoadSeriesSeriesFunctionArguments
 */

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
        points = fitPointsToContext(context, rawPoints);
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
      return generateFakePoints(context, context.lastPointTimestamp, {
        oldest: true,
        newest: isLastPointNewest,
      });
    } else {
      return [];
    }
  }

  // Cut off extra point (added to check for existence of older points)
  if (normalizedPoints.length > context.pointsCount) {
    normalizedPoints = normalizedPoints.slice(0, context.pointsCount);
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

function generateFakePoints(context, lastPointTimestamp, pointParams = {}) {
  const normalizedLastPointTimestamp = lastPointTimestamp -
    (lastPointTimestamp % context.timeResolution);
  const points = fitPointsToContext(context, [point(normalizedLastPointTimestamp, null)]);
  points.forEach((point) => Object.assign(point, { fake: true }, pointParams));
  return points;
}
