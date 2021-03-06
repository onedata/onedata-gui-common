/**
 * Generate URL for opening default view for Oneprovider (like in Oneprovider drop)
 * 
 * @module utils/get-visit-oneprovider-url
 * @author Jakub Liput
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { serializeAspectOptions } from 'onedata-gui-common/services/navigation-state';
import isStandaloneGuiOneprovider from 'onedata-gui-common/utils/is-standalone-gui-oneprovider';

export default function getVisitOneproviderUrl({
  router,
  guiUtils,
  provider,
  providerVersion,
  space,
}) {
  const spaceRoutableId = guiUtils.getRoutableIdFor(space);
  const providerRoutableId = guiUtils.getRoutableIdFor(provider);
  if (isStandaloneGuiOneprovider(providerVersion)) {
    return router.urlFor(
      'provider-redirect',
      providerRoutableId, {
        queryParams: {
          space_id: spaceRoutableId,
        },
      }
    );
  } else {
    return router.urlFor(
      'onedata.sidebar.content.aspect',
      'spaces',
      spaceRoutableId,
      'data', {
        queryParams: {
          options: serializeAspectOptions({
            oneproviderId: providerRoutableId,
          }),
        },
      }
    );
  }
}
