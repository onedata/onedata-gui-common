/**
 * Provides GUI context data set in `fetchGuiContext` initializer.
 * Facilitates mocking.
 * 
 * @module services/gui-context
 * @author Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service from '@ember/service';
import { getOwner } from '@ember/application';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';

export default Service.extend({
  guiMode: reads('data.guiMode'),
  serviceType: reads('data.seviceType'),
  clusterType: reads('data.clusterType'),
  clusterId: reads('data.clusterId'),
  browserDebugLogs: reads('data.browserDebugLogs'),
  apiOrigin: reads('data.apiOrigin'),

  data: computed(function data() {
    const application = getOwner(this).application;
    if (application) {
      return application.guiContext;
    } else {
      return {};
    }
  }),
});
