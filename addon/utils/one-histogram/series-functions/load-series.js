import _ from 'lodash';

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
        windowTimeSpan: context.windowTimeSpan,
        windowsCount: context.windowsCount,
      };
      return await externalDataSource.fetchData(
        fetchParams,
        args.sourceParameters.externalSourceParameters
      );
    }
    case 'empty':
    default: {
      if (!context.windowTimeSpan || !context.windowsCount) {
        return null;
      }
      let lastTimestamp = context.lastWindowTimestamp;
      if (!lastTimestamp) {
        lastTimestamp = Math.floor(Date.now() / 1000);
      }
      // The same algorithm of calculating window timestamps is used by backend
      lastTimestamp = lastTimestamp - lastTimestamp % context.windowTimeSpan;

      return _.times(context.windowsCount, (idx) => ({
        timestamp: lastTimestamp -
          (context.windowsCount - idx - 1) * context.windowTimeSpan,
        value: null,
      }));
    }
  }
}

export default loadSeries;

async function emptySeries(context) {
  return await loadSeries(context, {
    sourceType: 'empty',
  });
}
