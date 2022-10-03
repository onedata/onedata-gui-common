/**
 * A series function, which allows accessing dynamic config of a series group. It can
 * be used only in series group generated by `dynamic` series groups factory.
 *
 * Arguments:
 * - `propertyName` (string) name of a property, which should be extracted from the
 *   dynamic config. If not provided, the whole dynamic config object will be returned.
 *   If `propertyName` cannot be found in dynamic config, null will be returned.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/**
 * @typedef {Object} OTSCGetDSGCSeriesFunctionArguments
 * @property {string} [propertyName]
 */

/**
 * @param {OTSCSeriesFunctionContext} context
 * @param {OTSCGetDSGCSeriesFunctionArguments} args
 * @returns {unknown}
 */
export default function getDynamicSeriesGroupConfig(context, args) {
  let data = null;
  if ('dynamicSeriesGroupConfig' in context) {
    const config = context.dynamicSeriesGroupConfig;
    if (!args || !args.propertyName) {
      data = config;
    } else if (
      typeof config === 'object' &&
      config &&
      args.propertyName in config
    ) {
      data = config[args.propertyName];
    }
  }

  return {
    type: 'basic',
    data,
  };
}