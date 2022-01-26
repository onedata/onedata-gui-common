/**
 * Factory function responsible for generating series from `dynamic`
 * raw factory configuration.
 *
 * `dynamic` factory returns (possibly) many series generated from
 * `factoryArguments.seriesTemplate`. The number of series depends on the size of
 * dynamic configs array which is generated according to the spec in
 * `factoryArguments.dynamicSeriesConfigs` field.
 *
 * For now there is only one possibility to specify dynamic configs in
 * `factoryArguments.dynamicSeriesConfigs` - through external data source. Example:
 * ```
 * {
 *   factoryName: 'dynamic',
 *   factoryArguments: {
 *     dynamicSeriesConfigs: {
 *       sourceType: 'external',
 *       sourceParameters: {
 *         externalSourceName: 'mySource',
 *         externalSourceParameters: { ... },
 *       },
 *     },
 *     seriesTemplate: {
 *       id: {
 *         functionName: 'getDynamicSeriesConfigData',
 *         functionArguments: {
 *           propertyName: 'id',
 *         },
 *       },
 *       name: 'series1',
 *       type: 'bar',
 *       yAxisId: 'a1',
 *       data: {
 *         functionName: 'loadSeries',
 *         functionArguments: {
 *           sourceType: 'external',
 *           sourceParameters: {
 *             externalSourceName: 'dummy',
 *           },
 *         },
 *       },
 *     },
 *   },
 * }
 * ```
 *
 * In the above example factory will acquire dynamic configs from external data source
 * (`'mySource'`). That source should have method `fetchDynamicSeriesConfigs`, which
 * should return an array of objects - dynamic configs.
 *
 * It is possible (and even obligatory for `id` field) to use value
 * from dynamic config during series generation. Usage of such operation is visible
 * in the example above - `id` is calculated by taking value of `id` field from
 * dynamic config via `getDynamicSeriesConfigData` function. If `mySource`
 * returned result like `[{id: 's1'}, {id: 's2'}]`, then two series would be generated -
 * one with id = `'s1'` and another with id = `'s2'`.
 *
 * @module utils/one-time-series-chart/series-factories/static
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { all as allFulfilled } from 'rsvp';

/**
 * @typedef {Object} OTSCDynamicSeriesFactoryArguments
 * @property {OTSCRawDynamicSeriesConfigs} dynamicSeriesConfigs
 * @property {OTSCRawSeries} seriesTemplate
 */

/**
 * @typedef {OTSCExternalDataSourceRef} OTSCRawDynamicSeriesConfigs
 */

/**
 * @param {OTSCSeriesFactoryContext} context
 * @param {OTSCDynamicSeriesFactoryArguments} args
 * @returns {Promise<OTSCSeries[]>}
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
        !context.externalDataSources[externalSourceName].fetchDynamicSeriesConfigs
      ) {
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
