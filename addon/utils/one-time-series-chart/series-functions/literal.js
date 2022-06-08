/**
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/**
 * @typedef {Object} OTSCLiteralSeriesFunctionArguments
 * @property {unknown} data
 */

/**
 * @param {OTSCTransformFunctionContext} context
 * @param {OTSCLiteralSeriesFunctionArguments} args
 * @returns {unknown}
 */
export default function literal(context, args) {
  const data = (args && 'data' in args) ? args.data : null;
  return {
    type: 'basic',
    data,
  };
}
