/**
 * Contains typedefs related to automation lambda.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/**
 * @typedef {Object} AtmLambda
 * @property {Object<RevisionNumber, AtmLambdaRevision>} revisionRegistry
 */

/**
 * @typedef {Object} AtmLambdaRevision
 * @property {string} name
 * @property {AtmLambdaState} state
 * @property {string} [summary]
 * @property {string} [description]
 * @property {AtmLambdaOperationSpec} operationSpec
 * @property {number} preferredBatchSize
 * @property {Array<AtmLambdaParameterSpec>} configParameterSpecs
 * @property {Array<AtmLambdaParameterSpec>} argumentSpecs
 * @property {Array<AtmLambdaResultSpec>} resultSpecs
 * @property {AtmResourceSpec} resourceSpec
 */

/**
 * @typedef {'draft' | 'stable' | 'deprecated'} AtmLambdaState
 */

/**
 * @type {Object<string, AtmLambdaState>}
 */
export const AtmLambdaState = Object.freeze({
  Draft: 'draft',
  Stable: 'stable',
  Deprecated: 'deprecated',
});

/**
 * @type {Array<AtmLambdaState>}
 */
export const atmLambdaStatesArray = Object.freeze([
  AtmLambdaState.Draft,
  AtmLambdaState.Stable,
  AtmLambdaState.Deprecated,
]);

/**
 * @typedef {AtmLambdaOpenfaasOperationSpec} AtmLambdaOperationSpec
 */

/**
 * @typedef {Object} AtmLambdaOpenfaasOperationSpec
 * @property {'openfaas'} engine
 * @property {string} dockerImage
 * @property {AtmLambdaDockerExecutionOptions} dockerExecutionOptions
 */

/**
 * @typedef {'openfaas'} AtmLambdaExecutionEngine
 */

/**
 * @type {Object<string, AtmLambdaExecutionEngine>}
 */
export const AtmLambdaExecutionEngine = Object.freeze({
  Openfaas: 'openfaas',
});

/**
 * @typedef {Object} AtmLambdaDockerExecutionOptions
 * @property {boolean} readonly
 * @property {boolean} mountOneclient
 * @property {string} [oneclientMountPoint] available when `mountOneclient` is `true`
 * @property {string} [oneclientOptions] available when `mountOneclient` is `true`
 */

/**
 * @typedef {Object} AtmLambdaParameterSpec
 * @property {string} name
 * @property {AtmDataSpec} dataSpec
 * @property {boolean} isOptional
 * @property {string} defaultValue
 */

/**
 * @typedef {Object} AtmLambdaResultSpec
 * @property {string} name
 * @property {AtmDataSpec} dataSpec
 * @property {AtmLambdaResultRelayMethod} relayMethod
 */

/**
 * @typedef {'returnValue' | 'filePipe'} AtmLambdaResultRelayMethod
 */

/**
 * @type {Object<string, AtmLambdaResultRelayMethod>}
 */
export const AtmLambdaResultRelayMethod = Object.freeze({
  ReturnValue: 'returnValue',
  FilePipe: 'filePipe',
});
