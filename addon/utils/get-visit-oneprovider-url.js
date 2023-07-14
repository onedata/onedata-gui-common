/**
 * Generate URL for opening default view for Oneprovider (like in Oneprovider drop)
 *
 * @author Jakub Liput
 * @copyright (C) 2020-2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { serializeAspectOptions } from 'onedata-gui-common/services/navigation-state';
import isStandaloneGuiOneprovider from 'onedata-gui-common/utils/is-standalone-gui-oneprovider';
import { get } from '@ember/object';

export default function getVisitOneproviderUrl({
  router,
  guiUtils,
  provider,
  space,
}) {
  const spaceRoutableId = guiUtils.getRoutableIdFor(space);
  const providerRoutableId = guiUtils.getRoutableIdFor(provider);
  const providerVersion = get(provider, 'version');
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
