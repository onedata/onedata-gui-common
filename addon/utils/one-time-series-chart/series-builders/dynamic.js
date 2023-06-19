/**
 * Builder function responsible for generating series from `dynamic`
 * raw builder configuration.
 *
 * `dynamic` builder returns (possibly) many series generated from
 * `builderRecipe.seriesTemplate`. The number of series depends on the size of
 * dynamic configs array which is generated according to the spec in
 * `builderRecipe.dynamicSeriesConfigsSource` field.
 *
 * For now there is only one possibility to specify dynamic configs in
 * `builderRecipe.dynamicSeriesConfigsSource` - through external data source. Example:
 * ```
 * {
 *   builderType: 'dynamic',
 *   builderRecipe: {
 *     dynamicSeriesConfigsSource: {
 *       sourceType: 'external',
 *       sourceSpec: {
 *         externalSourceName: 'mySource',
 *         externalSourceParameters: { ... },
 *       },
 *     },
 *     seriesTemplate: {
 *       idProvider: {
 *         functionName: 'getDynamicSeriesConfig',
 *         functionArguments: {
 *           propertyName: 'id',
 *         },
 *       },
 *       nameProvider: {
 *         functionName: 'literal',
 *         functionArguments: {
 *           data: 'series1',
 *         },
 *       },
 *       typeProvider: {
 *         functionName: 'literal',
 *         functionArguments: {
 *           data: 'bar',
 *         },
 *       },
 *       yAxisIdProvider: {
 *         functionName: 'literal',
 *         functionArguments: {
 *           data: 'a1',
 *         },
 *       },
 *       dataProvider: {
 *         functionName: 'loadSeries',
 *         functionArguments: {
 *           sourceType: 'external',
 *           sourceSpecProvider: {
 *             functionName: 'literal',
 *             functionArguments: {
 *               data: {
 *                 externalSourceName: 'dummy',
 *               },
 *             },
 *           },
 *         },
 *       },
 *     },
 *   },
 * }
 * ```
 *
 * In the above example builder will acquire dynamic configs from external data source
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
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { all as allFulfilled } from 'rsvp';

/**
 * @typedef {Object} OTSCDynamicSeriesBuilderRecipe
 * @property {OTSCRawDynamicSeriesConfigsSource} dynamicSeriesConfigsSource
 * @property {OTSCRawSeries} seriesTemplate
 */

/**
 * @typedef {OTSCExternalDataSourceRef} OTSCRawDynamicSeriesConfigsSource
 */

/**
 * @param {OTSCSeriesBuilderContext} context
 * @param {OTSCDynamicSeriesBuilderRecipe} recipe
 * @returns {Promise<OTSCSeries[]>}
 */
export default async function dynamic(context, recipe) {
  if (!recipe || !recipe.dynamicSeriesConfigsSource || !recipe.seriesTemplate) {
    return [];
  }

  const {
    sourceType,
    sourceSpec,
  } = recipe.dynamicSeriesConfigsSource;

  let dynamicSeriesConfigs;
  switch (sourceType) {
    case 'external': {
      const externalSourceName = sourceSpec && sourceSpec.externalSourceName;
      const externalSourceParameters = sourceSpec && sourceSpec.externalSourceParameters;
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
      recipe.seriesTemplate
    )
  ));
}
