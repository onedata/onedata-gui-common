/**
 * Unpack string with error from backend rejected request
 *
 * Handles:
 * - onepanel server response errors
 * - plain object with `message` property
 *
 * @module utils/get-error-description
 * @author Jakub Liput
 * @copyright (C) 2017-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';

const {
  String: { htmlSafe },
  Handlebars: { Utils: { escapeExpression } }
} = Ember;

/**
 * Gets error details from error object that is returned on onepanel backend reject
 *
 * Additionally, it supports a plain object with ``message`` property
 *
 * @export
 * @param {object|string} error
 * @return {EmberGlimmer.SafeString}
 */
export default function getErrorDescription(error) {
  const details = error && error.response && error.response.body &&
    parseRest(error.response.body) ||
    error.message ||
    error;

  return htmlSafe(escapeExpression(details));
}

function parseRest(body) {
  return isSimpleRestError(body) ? simpleRestError(body) : complexRestError(body);
}

function isSimpleRestError(body) {
  const { hosts } = body;

  return !!(hosts && typeof hosts === 'object' && Object.keys(hosts).length === 1);
}

function simpleRestError(body) {
  const { hosts } = body;
  return body.hosts[Object.keys(hosts)[0]].description;
}

function complexRestError(body) {
  const {
    error,
    description,
    'module': errModule,
    'function': errFunction,
    hosts,
  } = body;

  let str = `${error}`;
  if (description) {
    str += `: ${description.replace(/\.$/, '')}. `;
  }
  if (errFunction && errModule) {
    `Appeared in function ${errFunction} in module ${errModule}. `;
  }
  if (hosts && typeof hosts === 'object') {
    for (const hostname in hosts) {
      const { error: hostError, description: hostDescription } = hosts[hostname];
      str +=
        `Service on host ${hostname} failed with ${hostError}: ${hostDescription.replace(/\.$/, '')}. `;
    }
  }
  return str;
}
