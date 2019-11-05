/**
 * Fetch and set `Application.guiContext` object with gui context data.
 * 
 * Also creates `Application.getOnedataConfig(): Promise<Object>` method for accessing
 * the config in other modules.
 * 
 * @module initializers/fetch-gui-context
 * @author Jakub Liput
 * @copyright (C) 2016-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { resolve } from 'rsvp';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import $ from 'jquery';
import config from 'ember-get-config';
import { isDevelopment } from 'onedata-gui-websocket-client/utils/development-environment';

export const mockGuiContext = {
  guiMode: 'unified',
  serviceType: 'worker',
  clusterType: 'oneprovider',
  clusterId: 'mock_cluster_id',
  browserDebugLogs: true,
  apiOrigin: location.origin,
};

export function initialize(application) {
  application.guiContextProxy = PromiseObject.create({
    promise: resolve($.ajax('./gui-context'))
      .catch(error => {
        if (isDevelopment(config)) {
          return mockGuiContext;
        } else {
          throw error;
        }
      }),
  });
  application.deferReadiness();
  return application.guiContextProxy
    .then(guiContext => {
      application.guiContext = guiContext;
    })
    .catch(error => {
      console.error('Failed to fetch guiContext');
      application.guiContextError = error;
      throw error;
    })
    .finally(() => {
      application.advanceReadiness();
    });
}

export default {
  name: 'fetch-gui-context',
  initialize: initialize
};
