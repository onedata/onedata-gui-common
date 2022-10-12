/**
 * Provides utils for generating REST commands for various operations in Onedata.
 * 
 * See REST API documentation (eg. on https://onedata.org/#/home/api)
 * for details or browse one of Swagger definitions (eg.
 * https://github.com/onedata/oneprovider-swagger).
 *
 * @module services/rest-api-generator
 * @author Jakub Liput, Agnieszka Warchoł
 * @copyright (C) 2021-2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import ApiStringGenerator from './api-string-generator';
import { get } from '@ember/object';

/**
 * @typedef {Object} ApiSample
 * @property {string} apiRoot
 * @property {Object|null} data
 * @property {string} description
 * @property {boolean} followRedirects
 * @property {Object} headers
 * @property {string} method
 * @property {string} name
 * @property {string} path
 * @property {Object} placeholders
 * @property {boolean} requiresAuthorization
 * @property {string} swaggerOperationId
 * @property {'rest'|'xrootd'} type
 */

export default ApiStringGenerator.extend({
  /**
   * @param {ApiSample} apiSample
   * @returns {String}
   */
  generateSample(apiSample) {
    const template = ['curl'];

    // "Follow redirects" flag
    if (apiSample.followRedirects) {
      template.push('-L');
    }

    // HTTP method and path
    template.push('-X', '{method}', '{path}');
    const templateData = {
      method: apiSample.method,
      path: apiSample.apiRoot + apiSample.path,
    };

    // Authorization header
    if (apiSample.requiresAuthorization) {
      template.push('-H', '{authorizationHeader}');
      templateData.authorizationHeader = 'x-auth-token: $TOKEN';
    }

    // Data
    if (apiSample.data) {
      template.push('-d', '{data}');
      templateData.data = apiSample.data || '';
    }

    return this.fillTemplate(template, templateData);
  },

  curlize(url, curlOptions) {
    return `curl${curlOptions? ' ' + curlOptions : ''} ${url}`;
  },
});
