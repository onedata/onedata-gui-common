import emptySeries from './empty-series';
import _ from 'lodash';

/**
 * @typedef {OneHistogramExternalSourceSpec|OneHistogramConstValueSourceSpec} OneHistogramLoadSeriesSeriesFunctionArguments
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
 * @typedef {Object} OneHistogramConstValueSourceSpec
 * @property {'constValue'} sourceType
 * @property {OneHistogramConstValueSourceParametersSpec} sourceParameters
 */

/**
 * @typedef {Object} OneHistogramConstValueSourceParametersSpec
 * @property {number} value
 */

/**
 * @param {OneHistogramSeriesFunctionContext} context
 * @param {OneHistogramLoadSeriesSeriesFunctionArguments} args
 * @returns {Promise<Array<OneHistogramSeriesPoint[]>>}
 */
export default async function loadSeries(context, args) {
  switch (args.sourceType) {
    case 'external': {
      const externalDataSource = context.externalDataSources[args.sourceParameters.externalSourceName];
      if (!externalDataSource) {
        return emptySeries(context);
      }
      const fetchParams = {
        startTimestamp: context.startTimestamp,
        endTimestamp: context.endTimestamp,
      };
      return await externalDataSource.fetchData(
        fetchParams,
        args.sourceParameters.externalSourceParameters
      );
    }
    case 'constValue': {
      // TODO: VFS-8724 Take into account different time windows
      return _.times(context.endTimestamp - context.startTimestamp + 1, (idx) => ({
        timestamp: context.startTimestamp + idx,
        value: args.sourceParameters.value,
      }));
    }
  }
}
