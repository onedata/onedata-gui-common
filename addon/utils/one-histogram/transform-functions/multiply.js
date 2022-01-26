/**
 * A transform function, which calculates result of multiplying given operands.
 *
 * Arguments:
 * - `operands` - is an array of (mixed):
 *     - numbers,
 *     - arrays of numbers,
 *     - transform functions that will evaluate to one of above types.
 *
 * If some operands are transform functions, then they are evaluated before further processing.
 * NOTE: All array operands (also those obtained from transform functions evaluation)
 * must have the same length. Otherwise, null will be returned.
 *
 * In case of numbers operands multiplication result is striaghtforward. For operands
 * `[ 2, 3 ]` the result will be `6`.
 * In case of operands including arrays, all non-array operands are converted to
 * arrays of numbers by repeating a number as much as it is needed to reach the length
 * of other array-like operands. So for operands `[2, [3, 4, 5]]` it is converted to
 * `[[2, 2, 2], [3, 4, 5]]`. After that, arrays are multiplied element-wise -
 * the first element of the first array is multiplied by the first element of the second array
 * and so on. For example for input:
 * ```
 * [
 *   2,
 *   [2, 3],
 *   [3, 4],
 * ]
 * ```
 * result will be: `[12, 24]`.
 *
 * In case of any non-number value, it will be converted to null. Any multuplication by
 * null will result in null. Example: `[[2, 3], [4, null]]` will result in `[8, null]`.
 *
 * @module utils/one-histogram/transform-functions/multiply
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import _ from 'lodash';

/**
 * @typedef {Object} OneHistogramMultiplyTransformFunctionArguments
 * @property {Array<OneHistogramRawFunction|Array<number|null>|number|null>} operands
 */

/**
 * @param {OneHistogramTransformFunctionContext} context
 * @param {OneHistogramMultiplyTransformFunctionArguments} args
 * @returns {Array<number|null>|number|null}
 */
export default function multiply(context, args) {
  if (!args || !Array.isArray(args.operands)) {
    return null;
  }

  const operands =
    args.operands.map(value => context.evaluateTransformFunction(context, value));

  let arrayOperandOccurred = false;
  let arrayLength = null;

  for (const operand of operands) {
    if (Array.isArray(operand)) {
      arrayOperandOccurred = true;
      if (arrayLength !== null) {
        // Lengths of arrays does not match. There is no good approach to solve
        // such inconsistency, so we return null to notify the incorrectens of data.
        if (arrayLength !== operand.length) {
          return null;
        }
      } else {
        arrayLength = operand.length;
      }
    }
  }

  if (arrayLength === null) {
    arrayLength = 1;
  }

  let resultArray = operandAsNumbersArray(operands[0], arrayLength);
  for (const operand of operands.slice(1)) {
    const operandAsArray = operandAsNumbersArray(operand, arrayLength);
    for (let i = 0; i < arrayLength; i++) {
      if (resultArray[i] === null) {
        continue;
      } else if (operandAsArray[i] === null) {
        resultArray[i] = null;
      } else {
        resultArray[i] *= operandAsArray[i];
      }
    }
  }

  return arrayOperandOccurred ? resultArray : resultArray[0];
}

function operandAsNumbersArray(operand, arrayLength) {
  return normalizeNumbersArray(
    Array.isArray(operand) ?
    operand : _.times(arrayLength, _.constant(operand))
  );
}

function normalizeNumbersArray(numbersArray) {
  return numbersArray.map(num => Number.isFinite(num) ? num : null);
}
