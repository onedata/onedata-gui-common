/**
 * Contains typedefs related to automation task.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/**
 * @typedef {Object} AtmTaskSchema
 * @property {string} id
 * @property {string} name
 * @property {string} lambdaId
 * @property {RevisionNumber} lambdaRevisionNumber
 * @property {AtmLambdaConfig} lambdaConfig
 * @property {AtmTaskArgumentMapping} argumentMappings
 * @property {AtmTaskResultMapping} resultMappings
 * @property {AtmTimeSeriesStoreConfig|null} timeSeriesStoreConfig
 * @property {AtmResourceSpec|null} resourceSpecOverride
 */

/**
 * @typedef {Object<string, unknown>} AtmLambdaConfig
 */

/**
 * @typedef {Object} AtmTaskArgumentMapping
 * @property {string} argumentName
 * @property {AtmTaskArgumentMappingValueBuilder} valueBuilder
 */

/**
 * @typedef {Object} AtmTaskArgumentMappingValueBuilder
 * @property {AtmTaskArgumentMappingValueBuilderType} valueBuilderType
 * @property {unknown} valueBuilderRecipe has different meaning depending on
 *   `valueBuilderType`:
 *   - `undefined` for `'iteratedItem'`,
 *   - JSON value for `'const'`,
 *   - store schema id for `'singleValueStoreContent'`.
 */

/**
 * @typedef {'iteratedItem' | 'const' | 'singleValueStoreContent'} AtmTaskArgumentMappingValueBuilderType
 */

/**
 * @type {Object<string, AtmTaskArgumentMappingValueBuilderType>}
 */
export const AtmTaskArgumentMappingValueBuilderType = Object.freeze({
  IteratedItem: 'iteratedItem',
  Const: 'const',
  SingleValueStoreContent: 'singleValueStoreContent',
});

/**
 * @type {Array<AtmTaskArgumentMappingValueBuilderType>}
 */
export const atmTaskArgumentMappingValueBuilderTypesArray = Object.freeze([
  AtmTaskArgumentMappingValueBuilderType.IteratedItem,
  AtmTaskArgumentMappingValueBuilderType.Const,
  AtmTaskArgumentMappingValueBuilderType.SingleValueStoreContent,
]);

/**
 * @typedef {Object} AtmTaskResultMapping
 * @property {string} resultName
 * @property {string} storeSchemaId
 * @property {AtmStoreContentUpdateOptions} storeContentUpdateOptions
 */
