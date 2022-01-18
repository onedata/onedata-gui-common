import { all as allFulfilled } from 'rsvp';

/**
 * @typedef {Object} OneHistogramDynamicSeriesFactoryArguments
 * @property {OneHistogramRawDynamicSeriesConfigs} dynamicSeriesConfigs
 * @property {OneHistogramRawSeries} seriesTemplate
 */

/**
 * @typedef {OneHistogramRawDynamicSeriesExternalConfigs} OneHistogramRawDynamicSeriesConfigs
 */

/**
 * @typedef {Object} OneHistogramRawDynamicSeriesExternalConfigs
 * @property {'external'} sourceType
 * @property {OneHistogramRawDynamicSeriesExternalConfigsParams} sourceParameters
 */

/**
 * @typedef {Object} OneHistogramRawDynamicSeriesExternalConfigsParams
 * @property {string} externalSourceName
 * @property {Object} [externalSourceParameters]
 */

/**
 * @param {OneHistogramSeriesFactoryContext} context
 * @param {OneHistogramDynamicSeriesFactoryArguments} args
 * @returns {Promise<OneHistogramSeries[]>}
 */
export default async function dynamic(context, args) {
  if (!args || !args.dynamicSeriesConfigs || !args.seriesTemplate) {
    return [];
  }

  const {
    sourceType,
    sourceParameters,
  } = args.dynamicSeriesConfigs;

  let dynamicSeriesConfigs;
  switch (sourceType) {
    case 'external': {
      const externalSourceName = sourceParameters && sourceParameters.externalSourceName;
      const externalSourceParameters = sourceParameters && sourceParameters.externalSourceParameters;
      if (
        !externalSourceName ||
        !context.externalDataSources[externalSourceName] ||
        !context.externalDataSources[externalSourceName].fetchDynamicSeriesConfigs) {
        dynamicSeriesConfigs = [];
      } else {
        dynamicSeriesConfigs = await context.externalDataSources[externalSourceName]
          .fetchDynamicSeriesConfigs(externalSourceParameters);
      }
      break;
    }
    default:
      dynamicSeriesConfigs = [];
      break;
  }

  return allFulfilled(dynamicSeriesConfigs.map((dynamicSeriesConfig) =>
    context.evaluateSeries(
      Object.assign({}, context, { dynamicSeriesConfig }),
      args.seriesTemplate
    )
  ));
}
