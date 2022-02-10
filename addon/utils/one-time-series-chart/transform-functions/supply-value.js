/**
 * A special transform function, which is responsible for providing some implicitely
 * injected value. E.g. when calculating a Y axis label, then that implicite value
 * is a number taken from Y axis.
 *
 * Arguments: this function does not accept any arguments.
 *
 * @module utils/one-time-series-chart/series-functions/supply-value
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/**
 * @typedef {Object} OTSCSupplyValueTransformFunctionArguments
 */

/**
 * @param {OTSCTransformFunctionContext} context
 * @param {OTSCSupplyValueTransformFunctionArguments} args
 * @returns {unknown}
 */
export default function supplyValue(context /**, args */ ) {
  return 'valueToSupply' in context ? context.valueToSupply : null;
}
