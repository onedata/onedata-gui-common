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

export default ApiStringGenerator.extend({
  generateSample(apiSample) {
    const method = get(apiSample, 'method');
    const path = get(apiSample, 'apiRoot') + get(apiSample, 'path');
    const redirect = get(apiSample, 'followRedirects') ? '-L' : '';
    return this.fillTemplate(['curl', '{redirect}', '-X', '{method}', '{path}'], {
      redirect,
      method,
      path,
    });
  },

  curlize(url, curlOptions) {
    return `curl${curlOptions? ' ' + curlOptions : ''} ${url}`;
  },
});
