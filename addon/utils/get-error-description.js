/**
 * Unpack string with error from backend rejected request
 *
 * Handles:
 * - onepanel server response errors
 * - plain object with `message` property
 *
 * @module utils/get-error-description
 * @author Jakub Liput, Michal Borzecki
 * @copyright (C) 2017-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { htmlSafe, isHTMLSafe } from '@ember/string';
import Ember from 'ember';

/**
 * Gets error details from error object that is returned on onepanel backend reject
 *
 * Additionally, it supports a plain object with ``message`` property
 *
 * @export
 * @param {object|string} error
 * @return {object}
 */
export default function getErrorDescription(error) {
  let details = error && error.response && error.response.body &&
    (error.response.body.description || error.response.body.error) ||
    error && error.message ||
    error;
  let errorJson;
  let message;
  if (typeof details === 'object' && !isHTMLSafe(details)) {
    try {
      errorJson = htmlSafe(Ember.Handlebars.Utils.escapeExpression(
        JSON.stringify(error)
      ));
    } catch (e) {
      if (!(e instanceof TypeError)) {
        throw error;
      }
    }
  } else {
    message = htmlSafe(Ember.Handlebars.Utils.escapeExpression(details));
  }

  return {
    message,
    errorJsonString: errorJson,
  };
}
