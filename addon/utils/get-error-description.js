/**
 * Unpack string with error from backend rejected request
 *
 * @module utils/get-error-description
 * @author Michał Borzęcki
 * @copyright (C) 2019-2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { htmlSafe, isHTMLSafe } from '@ember/string';
import { getProperties } from '@ember/object';
import Ember from 'ember';
import _ from 'lodash';
import bytesToString from 'onedata-gui-common/utils/bytes-to-string';
import { isMissingMessage } from 'onedata-gui-common/utils/i18n/missing-message';

const i18nPrefix = 'errors.backendErrors.';

const detailsTranslateFunctions = {
  posix: posixDetailsTranslator,
  badServiceToken: createNestedErrorDetailsTranslator('tokenError'),
  badConsumerToken: createNestedErrorDetailsTranslator('tokenError'),
  badValueToken: createNestedErrorDetailsTranslator('tokenError'),
  notAnAccessToken: notAnXTokenDetailsTranslator,
  notAnIdentityToken: notAnXTokenDetailsTranslator,
  notAnInviteToken: notAnXTokenDetailsTranslator,
  tokenServiceForbidden: tokenServiceForbiddenDetailsError,
  inviteTokenConsumerInvalid: inviteTokenConsumerInvalidDetailsError,
  storageTestFailed: storageTestFailedDetailsTranslator,
  fileAccess: posixDetailsTranslator,
  noServiceNodes: noServiceNodesDetailsTranslator,
  fileAllocation: fileAllocationDetailsTranslator,
  nodeNotCompatible: nodeNotCompatibleDetailsTranslator,
  errorOnNodes: createNestedErrorDetailsTranslator(),
  requiresPosixCompatibleStorage: createArrayDetailsToStringsTranslator([
    'posixCompatibleStorages',
  ]),
  autoStorageImportNotSupported: createArrayDetailsToStringsTranslator([
    'supportedStorages',
    'supportedObjectStorages',
  ]),
  fileRegistrationNotSupported: createArrayDetailsToStringsTranslator(['objectStorages']),
  badData: badDataDetailsTranslator,
};

/**
 * Gets error details from error object that is returned on websocket backend
 * reject.
 *
 * @export
 * @param {object} error
 * @param {object} i18n
 * @return {object}
 */
export default function getErrorDescription(error, i18n) {
  let message;
  let stringifyError = false;

  if (typeof error === 'object' && error.id) {
    message = findTranslationForError(i18n, error);
    stringifyError = true;
  } else if (typeof error === 'object' && error.message) {
    message = error.message;
  } else if (isHTMLSafe(error)) {
    message = error;
  } else {
    stringifyError = true;
  }

  return {
    message: toPrintableString(message),
    errorJsonString: stringifyError ? toFormattedJson(error) : undefined,
  };
}

function findTranslationForError(i18n, error) {
  const {
    id: errorId,
    details: errorDetails = {},
  } = getProperties(error, 'id', 'details');

  const detailsToTranslateFun = detailsTranslateFunctions[errorId];
  let errorDetailsToTranslate = detailsToTranslateFun ?
    detailsToTranslateFun(i18n, errorDetails) : errorDetails;

  return findTranslation(
    i18n,
    i18nPrefix + errorId,
    errorDetailsToTranslate
  );
}

function findTranslation(i18n, key, placeholders) {
  const translation = i18n.t(key, placeholders);
  const translationAsString = translation ? translation.toString() : '';
  return (!translationAsString || isMissingMessage(translation)) ?
    undefined : translation;
}

function toPrintableString(string) {
  return string && string.toString() ?
    htmlSafe(Ember.Handlebars.Utils.escapeExpression(string)) : undefined;
}

function toFormattedJson(data) {
  if (!data) {
    return undefined;
  } else {
    try {
      const stringifiedJson = JSON.stringify(data, null, 2);
      return htmlSafe(
        `<code>${Ember.Handlebars.Utils.escapeExpression(stringifiedJson)}</code>`
      );
    } catch (e) {
      return undefined;
    }
  }
}

function posixDetailsTranslator(i18n, errorDetails) {
  const errnoTranslation =
    findTranslation(i18n, `${i18nPrefix}translationParts.posixErrno.${errorDetails.errno}`);
  return Object.assign({}, errorDetails, { errno: errnoTranslation });
}

function notAnXTokenDetailsTranslator(i18n, errorDetails) {
  const receivedTranslation =
    findTokenTypeTranslation(i18n, errorDetails.received);
  return Object.assign({}, errorDetails, { received: receivedTranslation });
}

function findTokenTypeTranslation(i18n, tokenType) {
  let translation = '';
  if (tokenType.accessToken) {
    translation =
      findTranslation(i18n, i18nPrefix + 'translationParts.accessToken');
  } else if (tokenType.identityToken) {
    translation =
      findTranslation(i18n, i18nPrefix + 'translationParts.identityToken');
  } else if (tokenType.inviteToken) {
    translation =
      tokenType.inviteToken.inviteType + ' ' +
      findTranslation(i18n, i18nPrefix + 'translationParts.inviteToken');
  }
  return translation;
}

function tokenServiceForbiddenDetailsError(i18n, errorDetails) {
  const service = errorDetails.service || {};
  const serviceTranslation = resourceTypeAndIdToString(service);
  return Object.assign({}, errorDetails, { service: serviceTranslation });
}

function inviteTokenConsumerInvalidDetailsError(i18n, errorDetails) {
  const consumer = errorDetails.consumer || {};
  const consumerTranslation = resourceTypeAndIdToString(consumer);
  return Object.assign({}, errorDetails, { consumer: consumerTranslation });
}

function resourceTypeAndIdToString(resource) {
  return `${resource.type}:${resource.id}`;
}

function storageTestFailedDetailsTranslator(i18n, errorDetails) {
  const operationTranslation =
    findTranslation(i18n,
      `${i18nPrefix}translationParts.storageTestOperations.${errorDetails.operation}`);
  return Object.assign({}, errorDetails, {
    operation: operationTranslation || errorDetails.operation,
  });
}

function noServiceNodesDetailsTranslator(i18n, errorDetails) {
  const serviceTranslation =
    findTranslation(i18n,
      `${i18nPrefix}translationParts.nodeServices.${errorDetails.service}`);
  return Object.assign({}, errorDetails, {
    service: serviceTranslation || errorDetails.service,
  });
}

function fileAllocationDetailsTranslator(i18n, errorDetails) {
  const actualSize = bytesToString(errorDetails.actualSize);
  const targetSize = bytesToString(errorDetails.targetSize);
  return Object.assign({}, errorDetails, {
    actualSize,
    targetSize,
  });
}

function nodeNotCompatibleDetailsTranslator(i18n, errorDetails) {
  const clusterType = _.upperFirst(errorDetails.clusterType);
  return Object.assign({}, errorDetails, { clusterType });
}

function createNestedErrorDetailsTranslator(nestedErrorFieldName = 'error') {
  return (i18n, errorDetails) => {
    const nestedError = errorDetails[nestedErrorFieldName] || {};
    const nestedErrorTranslation =
      findTranslation(i18n, i18nPrefix + nestedError.id, nestedError.details);
    return Object.assign({}, errorDetails, {
      [nestedErrorFieldName]: nestedErrorTranslation,
    });
  };
}

function createArrayDetailsToStringsTranslator(arraysInDetails) {
  return (i18n, errorDetails) => {
    const convertedArrays = arraysInDetails.reduce((arrays, arrayName) => {
      if (_.isArray(errorDetails[arrayName])) {
        arrays[arrayName] = errorDetails[arrayName].join(', ');
      }
      return arrays;
    }, {});
    return Object.assign({}, errorDetails, convertedArrays);
  };
}

function badDataDetailsTranslator(i18n, errorDetails) {
  return Object.assign({}, errorDetails, {
    endingWithHint: errorDetails.hint ? `: ${errorDetails.hint}.` : '.',
  });
}
