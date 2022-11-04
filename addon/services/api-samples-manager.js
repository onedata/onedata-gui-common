/**
 * Provides api samples using Graph API.
 * 
 * @author Agnieszka Warchoł
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service, { inject as service } from '@ember/service';
import gri from 'onedata-gui-websocket-client/utils/gri';

export default Service.extend({
  onedataGraph: service(),

  /**
   * @type {Array<String>}
   */
  responseWhitelist: Object.freeze(['rest', 'xrootd']),

  /**
   * @param {String} entityId
   * @param {String} entityType
   * @param {String} scope one of: private, public
   * @returns {Array<ApiSample>}
   */
  async getApiSamples(entityId, entityType, scope = 'private') {
    const apiSamples = await this.get('onedataGraph').request({
      operation: 'get',
      gri: gri({
        entityType: entityType,
        entityId: entityId,
        aspect: 'api_samples',
        scope,
      }),
      subscribe: false,
    });
    let availableApiSamples = [];
    for (const [key, value] of Object.entries(apiSamples)) {
      if (this.responseWhitelist.includes(key)) {
        if (value.samples) {
          availableApiSamples = availableApiSamples.concat(
            value.samples.map(sample => {
              if (!('type' in sample)) {
                sample.type = key;
              }
              if ('apiRoot' in value) {
                sample.apiRoot = value.apiRoot;
              }
              return sample;
            })
          );
        } else {
          availableApiSamples = availableApiSamples.concat(
            value.map(sample => {
              if (!('type' in sample)) {
                sample.type = key;
              }
              return sample;
            })
          );
        }
      }
    }
    return availableApiSamples;
  },
});
