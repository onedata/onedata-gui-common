/**
 * Provides api samples using Graph API.
 * @author Agnieszka Warchoł
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service, { inject as service } from '@ember/service';
import gri from 'onedata-gui-websocket-client/utils/gri';

export default Service.extend({
  onedataGraph: service(),

  getApiSamples(entityId, entityType, scope = 'private') {
    return this.get('onedataGraph').request({
      operation: 'get',
      gri: gri({
        entityType: entityType,
        entityId: entityId,
        aspect: 'api_samples',
        scope,
      }),
      subscribe: false,
    });
  },
});
