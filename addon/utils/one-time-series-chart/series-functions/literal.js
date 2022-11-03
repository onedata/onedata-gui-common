/**
 * A special series function, which returns data provided in `data` argument.
 * Type of `data` does not matter.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/**
 * @typedef {Object} OTSCLiteralSeriesFunctionArguments
 * @property {'basic'|'points'} [type]
 * @property {unknown} data
 */

/**
 * @param {OTSCSeriesFunctionContext} context
 * @param {OTSCLiteralSeriesFunctionArguments} args
 * @returns {unknown}
 */
export default function literal(context, args) {
  const type = args?.type === 'points' ? 'points' : 'basic';
  const data = (args && 'data' in args) ? args.data : null;
  return {
    type,
    data,
  };
}
