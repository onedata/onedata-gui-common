import { isHistogramPointsArray } from './utils/points';

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
async function loadSeries(context, args) {
  switch (args.sourceType) {
    case 'external': {
      const externalDataSource =
        context.externalDataSources[args.sourceParameters.externalSourceName];
      if (!externalDataSource) {
        return await emptySeries(context);
      }
      const fetchParams = {
        lastWindowTimestamp: context.lastWindowTimestamp,
        timeResolution: context.timeResolution,
        windowsCount: context.windowsCount,
      };
      return fitPointsToContext(
        context,
        await externalDataSource.fetchData(
          fetchParams,
          args.sourceParameters.externalSourceParameters
        )
      );
    }
    case 'empty':
    default: {
      if (!context.timeResolution || !context.windowsCount) {
        return null;
      }
      let lastTimestamp = context.lastWindowTimestamp;
      if (!lastTimestamp) {
        lastTimestamp = Math.floor(Date.now() / 1000);
      }
      // The same algorithm of calculating window timestamps is used by backend
      lastTimestamp = lastTimestamp - lastTimestamp % context.timeResolution;

      // fitPointsToContext will add missing points and produce complete series of null values
      return fitPointsToContext(context, [{ timestamp: lastTimestamp, value: null }]);
    }
  }
}

export default loadSeries;

async function emptySeries(context) {
  return await loadSeries(context, {
    sourceType: 'empty',
  });
}

/**
 *
 * @param {OneHistogramSeriesFunctionContext} context
 * @param {OneHistogramSeriesPoint[]} points
 */
function fitPointsToContext(context, points) {
  if (!isHistogramPointsArray(points)) {
    return null;
  }
  // sort by timestamp descending
  let normalizedPoints = points.sortBy('timestamp').reverse();

  // remove points newer than context.lastWindowTimestamp
  if (context.lastWindowTimestamp) {
    normalizedPoints = normalizedPoints.filter(({ timestamp }) =>
      timestamp <= context.lastWindowTimestamp
    );
  }

  // remove points, that do not describe times matching context.timeResolution
  normalizedPoints = normalizedPoints.filter(({ timestamp }) =>
    (timestamp - normalizedPoints[0].timestamp) % context.timeResolution === 0
  );

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
      pointsToUnshift.push({
        timestamp: nextFakePointTimestamp,
        value: null,
      });
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
      normalizedPoints.push({ timestamp: nextPointTimestamp, value: null });
    }
    nextPointTimestamp -= context.timeResolution;
  }

  normalizedPoints = normalizedPoints.reverse();

  return normalizedPoints;
}
