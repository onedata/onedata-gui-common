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
    const method = get(apiSample, 'method');
    const path = get(apiSample, 'apiRoot') + get(apiSample, 'path');
    const redirect = get(apiSample, 'followRedirects') ? '-L' : '';
    const authorizationOption = get(apiSample, 'requiresAuthorization') ? '-H' : '';
    const authorizationHeader = authorizationOption ? 'x-auth-token: $TOKEN' : '';
    const data = get(apiSample, 'data') || '';
    const dataOption = data ? '-d' : '';

    return this.fillTemplate(['curl', '{redirect}', '-X', '{method}', '{path}',
      '{authorizationOption}', '{authorizationHeader}', '{dataOption}', '{data}',
    ], {
      redirect,
      method,
      path,
      authorizationOption,
      authorizationHeader,
      dataOption,
      data,
    }).trim();
  },

  curlize(url, curlOptions) {
    return `curl${curlOptions? ' ' + curlOptions : ''} ${url}`;
  },
});
