import { point } from './utils/points';

/**
 * @typedef {OneHistogramExternalSourceSpec} OneHistogramLoadSeriesSeriesFunctionArguments
 */

/**
 * @typedef {Object} OneHistogramExternalSourceSpec
 * @property {'external'} sourceType
 * @property {OneHistogramExternalSourceParametersSpec} sourceParameters
 */

/**
 * @typedef {Object} OneHistogramExternalSourceParametersSpec
 * @property {string} externalSourceName
 * @property {Object} externalSourceParameters
 */

/**
 * @param {OneHistogramSeriesFunctionContext} context
 * @param {OneHistogramLoadSeriesSeriesFunctionArguments} args
 * @returns {Promise<Array<OneHistogramSeriesPoint[]>>}
 */
export default async function loadSeries(context, args) {
  if (!context.timeResolution || !context.windowsCount) {
    return {
      type: 'series',
      data: [],
    };
  }

  let points;
  switch (args.sourceType) {
    case 'external': {
      const externalDataSource =
        context.externalDataSources[args.sourceParameters.externalSourceName];
      if (!externalDataSource) {
        points = [];
      } else {
        const fetchParams = {
          lastWindowTimestamp: context.lastWindowTimestamp,
          timeResolution: context.timeResolution,
          windowsCount: context.windowsCount + 1,
        };
        const rawPoints = await externalDataSource.fetchData(
          fetchParams,
          args.sourceParameters.externalSourceParameters
        );
        points = fitPointsToContext(context, rawPoints);
      }
      break;
    }
    case 'empty':
    default: {
      points = generateFakePoints(context, getAbsoluteLastWindowTimestamp(context), {
        newest: true,
        oldest: true,
      });
      break;
    }
  }
  return {
    type: 'series',
    data: points,
  };
}

/**
 *
 * @param {OneHistogramSeriesFunctionContext} context
 * @param {OneHistogramSeriesPoint[]} points
 */
function fitPointsToContext(context, points) {
  if (!isRawHistogramPointsArray(points)) {
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

  // Find out timestamp of globally oldest point
  let globallyOldestPointTimestamp = null;
  if (normalizedPoints.length < context.windowsCount + 1) {
    globallyOldestPointTimestamp = normalizedPoints[normalizedPoints.length - 1].timestamp;
  }

  // Remove points, that do not describe times matching context.timeResolution
  normalizedPoints = normalizedPoints.filter(({ timestamp }) =>
    (timestamp - normalizedPoints[0].timestamp) % context.timeResolution === 0
  );

  // Cut off extra window (added to check for existence of older points)
  if (normalizedPoints.length > context.windowsCount) {
    normalizedPoints = normalizedPoints.slice(0, context.windowsCount);
  }

  // Add missing points after received points
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

function isRawHistogramPointsArray(pointsArray) {
  return Array.isArray(pointsArray) && pointsArray.every(point =>
    point && typeof point === 'object' && 'timestamp' in point && 'value' in point
  );
}

function generateFakePoints(context, newestTimestamp, pointParams = {}) {
  const points = fitPointsToContext(context, [point(newestTimestamp, null)]);
  points.forEach((point) => Object.assign(point, { fake: true }, pointParams));
  return points;
}

function getAbsoluteLastWindowTimestamp(context) {
  return context.lastWindowTimestamp ||
    context.nowTimestamp ||
    Math.floor(Date.now() / 1000);
}
