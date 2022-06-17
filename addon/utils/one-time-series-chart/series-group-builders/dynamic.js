/**
 * Builder function responsible for generating series groups from `dynamic`
 * raw builder configuration.
 *
 * `dynamic` builder returns (possibly) many series groups generated from
 * `builderRecipe.seriesGroupTemplate`. The number of series groups depends
 * on the size of dynamic configs array which is generated according to the spec in
 * `builderRecipe.dynamicSeriesGroupConfigsSource` field.
 *
 * For now there is only one possibility to specify dynamic configs in
 * `builderRecipe.dynamicSeriesGroupConfigsSource` - through external data source. Example:
 * ```
 * {
 *   builderName: 'dynamic',
 *   builderRecipe: {
 *     dynamicSeriesGroupConfigsSource: {
 *       sourceType: 'external',
 *       sourceSpec: {
 *         externalSourceName: 'mySource',
 *         externalSourceParameters: { ... },
 *       },
 *     },
 *     seriesGroupTemplate: {
 *       idProvider: {
 *         functionName: 'getDynamicSeriesGroupConfig',
 *         functionArguments: {
 *           propertyName: 'id',
 *         },
 *       },
 *       nameProvider: {
 *         functionName: 'literal',
 *         functionArguments: {
 *           data: 'group1',
 *         },
 *       },
 *     },
 *   },
 * }
 * ```
 *
 * In the above example builder will acquire dynamic configs from external data source
 * (`'mySource'`). That source should have method `fetchDynamicSeriesGroupConfigs`, which
 * should return an array of objects - dynamic configs.
 *
 * It is possible (and even obligatory for `id` field) to use value
 * from dynamic config during series group generation. Usage of such operation is visible
 * in the example above - `id` is calculated by taking value of `id` field from
 * dynamic config via `getDynamicSeriesGroupConfigData` function. If `mySource`
 * returned result like `[{id: 's1'}, {id: 's2'}]`, then two series groups would be
 * generated - one with id = `'s1'` and another with id = `'s2'`.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/**
 * @typedef {Object} OTSCDynamicSeriesGroupBuilderArguments
 * @property {OTSCRawDynamicSeriesGroupConfigsSource} dynamicSeriesGroupConfigsSource
 * @property {OTSCRawSeriesGroup} seriesGroupTemplate
 */

/**
 * @typedef {OTSCExternalDataSourceRef} OTSCRawDynamicSeriesGroupConfigsSource
 */

import { all as allFulfilled } from 'rsvp';

/**
 * @param {OTSCSeriesGroupBuilderContext} context
 * @param {OTSCDynamicSeriesGroupBuilderArguments} args
 * @returns {Promise<OTSCSeriesGroup[]>}
 */
export default async function dynamic(context, args) {
  if (!args || !args.dynamicSeriesGroupConfigsSource || !args.seriesGroupTemplate) {
    return [];
  }

  const {
    sourceType,
    sourceSpec,
  } = args.dynamicSeriesGroupConfigsSource;

  let dynamicSeriesGroupConfigs;
  switch (sourceType) {
    case 'external': {
      const externalSourceName = sourceSpec && sourceSpec.externalSourceName;
      const externalSourceParameters = sourceSpec &&
        sourceSpec.externalSourceParameters;
      if (
        !externalSourceName ||
        !context.externalDataSources[externalSourceName] ||
        !context.externalDataSources[externalSourceName].fetchDynamicSeriesGroupConfigs
      ) {
        dynamicSeriesGroupConfigs = [];
      } else {
        dynamicSeriesGroupConfigs = await context.externalDataSources[externalSourceName]
          .fetchDynamicSeriesGroupConfigs(externalSourceParameters);
      }
      break;
    }
    default:
      dynamicSeriesGroupConfigs = [];
      break;
  }

  return allFulfilled(dynamicSeriesGroupConfigs.map((dynamicSeriesGroupConfig) =>
    context.evaluateSeriesGroup(
      Object.assign({}, context, { dynamicSeriesGroupConfig }),
      args.seriesGroupTemplate
    )
  ));
}
