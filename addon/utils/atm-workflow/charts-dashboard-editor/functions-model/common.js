/**
 * Common typedefs and enums for chart functions.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/**
 * @typedef {'points' | 'number'} FunctionDataType
 */

export const FunctionDataType = Object.freeze({
  Points: 'points',
  Number: 'number',
});

/**
 * @typedef {Object} FunctionSpec<T extends FunctionBase>
 * @property {string} name
 * @property {Array<FunctionDataType>} returnedTypes
 * @property {boolean} [onlyForRepeatedSeries]
 * @property {boolean} [isNotAvailableForUser]
 * @property {{ new (): T }} modelClass
 */

/**
 * @typedef {Object} FunctionAttachableArgumentSpec
 * @property {string} name
 * @property {Array<FunctionDataType>} compatibleTypes
 * @property {boolean} [isArray]
 */
