/**
 * A special transform function, which is responsible for providing some implicitely
 * injected value. E.g. when calculating a Y axis label, then that implicite value
 * is a number taken from Y axis.
 *
 * Arguments: this function does not accept any arguments.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/**
 * @typedef {Object} OTSCCurrentValueTransformFunctionArguments
 */

/**
 * @param {OTSCTransformFunctionContext} context
 * @param {OTSCCurrentValueTransformFunctionArguments} args
 * @returns {unknown}
 */
export default function currentValue(context /**, args */ ) {
  return 'currentValue' in context ? context.currentValue : null;
}
