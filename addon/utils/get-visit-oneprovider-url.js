/**
 * Generate URL for opening default view for Oneprovider (like in Oneprovider drop)
 * 
 * @module utils/get-visit-oneprovider-url
 * @author Jakub Liput
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import modelRoutableId from 'onezone-gui/utils/model-routable-id';
import { get } from '@ember/object';
import config from 'ember-get-config';
import { serializeAspectOptions } from 'onedata-gui-common/services/navigation-state';

const {
  legacyOneproviderVersion,
} = config;

export default function getVisitOneproviderUrl({
  router,
  provider,
  providerVersion,
  space,
}) {
  if (providerVersion.startsWith(legacyOneproviderVersion)) {
    return router.urlFor(
      'provider-redirect',
      modelRoutableId(provider), {
        queryParams: {
          space_id: get(space, 'entityId'),
        },
      }
    );
  } else {
    return router.urlFor(
      'onedata.sidebar.content.aspect',
      'spaces',
      modelRoutableId(space),
      'data', {
        queryParams: {
          options: serializeAspectOptions({
            oneproviderId: get(provider, 'entityId'),
          }),
        },
      }
    );
  }
}
