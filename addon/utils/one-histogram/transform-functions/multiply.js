import _ from 'lodash';

/**
 * @typedef {Object} OneHistogramMultiplyTransformFunctionArguments
 * @property {Array<OneHistogramRawFunction|number|Array<number>>} operands
 */

/**
 * @param {OneHistogramTransformFunctionContext} context
 * @param {OneHistogramMultiplyTransformFunctionArguments} args
 * @returns {number|null|Array<number|null>}
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
      // Lengths of arrays does not match. There is no good approach to solve
      // such inconsistency, so we return null to notify the incorrectens of data.
      if (arrayLength !== null) {
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
  for (let operand of operands.slice(1)) {
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
