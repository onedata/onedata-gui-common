/**
 * Common typedefs and enums for chart functions.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

const i18nPrefix = 'utils.atmWorkflow.chartsDashboardEditor.functionsModel.common';

/**
 * @typedef {'points' | 'number'} FunctionDataType
 */

export const FunctionDataType = Object.freeze({
  Points: 'points',
  Number: 'number',
});

/**
 * @typedef {'axis' | 'series' | 'repeatedSeries'} FunctionExecutionContext
 */

export const FunctionExecutionContext = Object.freeze({
  Axis: 'axis',
  Series: 'series',
  RepeatedSeries: 'repeatedSeries',
});

/**
 * @typedef {Object} FunctionSpec<T extends FunctionBase>
 * @property {string} name
 * @property {Array<FunctionDataType>} returnedTypes
 * @property {boolean} [isNotAvailableForUser]
 * @property {Array<FunctionExecutionContext>} [allowedContexts]
 * @property {{ new (): T }} modelClass
 */

/**
 * @typedef {Object} FunctionAttachableArgumentSpec
 * @property {string} name
 * @property {Array<FunctionDataType>} compatibleTypes
 * @property {boolean} [isArray]
 */

/**
 * @param {Ember.Service} i18n
 * @param {string} functionName
 * @returns {SafeString}
 */
export function getFunctionNameTranslation(i18n, functionName) {
  return i18n.t(`${i18nPrefix}.functions.${functionName}.name`);
}

/**
 * @param {Ember.Service} i18n
 * @param {string} functionArgumentName
 * @returns {SafeString}
 */
export function getFunctionArgumentNameTranslation(i18n, functionName, argumentName) {
  return i18n.t(`${i18nPrefix}.functions.${functionName}.arguments.${argumentName}`);
}
