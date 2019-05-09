/**
 * Adds check of cluster HTTP server state.
 * 
 * @module mixins/cluster-online-check
 * @author Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Mixin from '@ember/object/mixin';
import checkImg from 'onedata-gui-common/utils/check-img';
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';
import { computed } from '@ember/object';

export default Mixin.create(createDataProxyMixin('isOnline'), {
  /**
   * @virtual
   * @type {string|ComputedProperty<string>}
   */
  domain: undefined,

  standaloneOrigin: computed('domain', function standaloneOrigin() {
    return `https://${this.get('domain')}:9443`;
  }),

  /**
   * @override
   */
  fetchIsOnline() {
    const origin = this.get('standaloneOrigin');
    return checkImg(`${origin}/favicon.ico`);
  },
});
