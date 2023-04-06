/**
 * Validates passed workflow schema revision and returns an array of found errors.
 * It's still a very oversimplified validator and checks only for errors which
 * can be introduced by a user through workflow editor.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import _ from 'lodash';

/**
 * @typedef {Object} AtmWorkflowSchemaValidationError
 * @property {string} elementId
 * @property {AtmWorkflowSchemaValidationErrorId} errorId
 * @property {string} errorMessage
 */

/**
 * @typedef {
 *   'laneIteratorStoreMissing' |
 *   'taskArgumentSourceStoreMissing' |
 *   'taskResultTargetStoreMissing'
 * } AtmWorkflowSchemaValidationErrorId
 */

const AtmWorkflowSchemaValidationErrorId = Object.freeze({
  LaneIteratorStoreMissing: 'laneIteratorStoreMissing',
  TaskArgumentSourceStoreMissing: 'taskArgumentSourceStoreMissing',
  TaskResultTargetStoreMissing: 'taskResultTargetStoreMissing',
});

/**
 * @type {string}
 */
const i18nPrefix = 'utils.atmWorkflow.validateAtmWorkflowSchemaRevision';

/**
 * @param {Ember.Service} i18n
 * @param {Object} revision JSON representation of possibly-valid workflow
 * schema revision
 * @returns {Array<AtmWorkflowSchemaValidationError>}
 */
export default function validateAtmWorkflowSchemaRevision(i18n, revision) {
  const storesMap = revision?.stores?.reduce((acc, store) => {
    if (store?.id) {
      acc[store.id] = store;
    }
    return acc;
  }, {}) ?? {};

  const validationContext = {
    i18n,
    storesMap,
  };

  const errors = _.flatten(revision?.lanes?.map((lane) =>
    validateAtmLane(validationContext, lane)
  ) ?? []);

  return errors;
}

/**
 * @typedef {Object} AtmLaneValidationContext
 * @property {Ember.Service} i18n
 * @property {Object<string, Object>} storesMap Map `store.id` -> `store` of all
 *   workflow stores.
 */

/**
 * @param {AtmLaneValidationContext} validationContext
 * @param {Object} lane JSON representation of possibly-valid lane
 * @returns {Array<AtmWorkflowSchemaValidationError>}
 */
function validateAtmLane(validationContext, lane) {
  if (!lane || !lane.id) {
    return [];
  }
  const i18n = validationContext.i18n;

  const errors = [];

  const iteratedStoreId = lane?.storeIteratorSpec?.storeSchemaId;
  if (!(iteratedStoreId in validationContext.storesMap)) {
    errors.push(createValidationError(
      i18n,
      lane.id,
      AtmWorkflowSchemaValidationErrorId.LaneIteratorStoreMissing, {
        laneName: lane.name ?? '',
      }
    ));
  }

  const nestedElementErrors = _.flatten(lane.parallelBoxes?.map((parallelBox) =>
    validateAtmParallelBox(validationContext, parallelBox)
  ) ?? []);

  return [...errors, ...nestedElementErrors];
}

/**
 * @param {AtmLaneValidationContext} validationContext
 * @param {Object} parallelBox JSON representation of possibly-valid lane
 * @returns {Array<AtmWorkflowSchemaValidationError>}
 */
function validateAtmParallelBox(validationContext, parallelBox) {
  if (!parallelBox || !parallelBox.id) {
    return [];
  }

  const nestedElementErrors = _.flatten(parallelBox.tasks?.map((task) =>
    validateAtmTask(validationContext, task)
  ) ?? []);

  return nestedElementErrors;
}

/**
 * @param {AtmLaneValidationContext} validationContext
 * @param {Object} task JSON representation of possibly-valid lane
 * @returns {Array<AtmWorkflowSchemaValidationError>}
 */
function validateAtmTask(validationContext, task) {
  if (!task || !task.id) {
    return [];
  }
  const i18n = validationContext.i18n;

  const errors = [];

  task.argumentMappings
    ?.filter((mapping) =>
      mapping?.valueBuilder?.valueBuilderType === 'singleValueStoreContent'
    )
    ?.forEach((mapping) => {
      const storeSchemaId = mapping.valueBuilder.valueBuilderRecipe;
      if (!(storeSchemaId in validationContext.storesMap)) {
        errors.push(createValidationError(
          i18n,
          task.id,
          AtmWorkflowSchemaValidationErrorId.TaskArgumentSourceStoreMissing, {
            taskName: task.name ?? '',
            argumentName: mapping.argumentName ?? '',
          }
        ));
      }
    });

  task.resultMappings
    ?.forEach((mapping) => {
      const storeSchemaId = mapping?.storeSchemaId;
      if (
        // If schemaId contains `_` it means that it is a special internal reference,
        // not an ID.
        !storeSchemaId?.includes('_') &&
        !(storeSchemaId in validationContext.storesMap)
      ) {
        errors.push(createValidationError(
          i18n,
          task.id,
          AtmWorkflowSchemaValidationErrorId.TaskResultTargetStoreMissing, {
            taskName: task.name ?? '',
            resultName: mapping.resultName ?? '',
          }
        ));
      }
    });

  return errors;
}

/**
 * @param {Ember.Service} i18n
 * @param {string} elementId
 * @param {AtmWorkflowSchemaValidationErrorId} errorId
 * @param {Object} errorMessageI18nPlaceholders
 * @returns {AtmWorkflowSchemaValidationError}
 */
function createValidationError(
  i18n,
  elementId,
  errorId,
  errorMessageI18nPlaceholders = {},
) {
  return {
    elementId,
    errorId,
    errorMessage: i18n.t(`${i18nPrefix}.${errorId}`, errorMessageI18nPlaceholders),
  };
}
