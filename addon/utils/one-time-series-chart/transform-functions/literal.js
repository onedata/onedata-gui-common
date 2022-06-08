/**
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/**
 * @typedef {Object} OTSCLiteralTransformFunctionArguments
 * @property {unknown} data
 */

/**
 * @param {OTSCTransformFunctionContext} context
 * @param {OTSCLiteralTransformFunctionArguments} args
 * @returns {unknown}
 */
export default function literal(context, args) {
  return (args && 'data' in args) ? args.data : null;
}
