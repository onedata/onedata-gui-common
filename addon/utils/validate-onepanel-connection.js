/**
 * Checks if there is a connectivity to Onepanel needed to display its GUI and if
 * the Onepanel has the same clusterId as expected.
 * There can be duplicated clusters with the same hostname, but with different
 * ids. These with invalid clusterIds should be presented as dead and allow only to
 * deregister them. 
 *
 * @module utils/validate-onepanel-connection
 * @author Jakub Liput
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import $ from 'jquery';
import { resolve, Promise } from 'rsvp';

export default function validateOnepanelConnection(clusterOrigin, clusterId) {
  let timeout = new Promise((resolve, reject) => {
    setTimeout(() => {
      reject();
    }, 10000);
  });
  return Promise.race([
    resolve($.get(`${clusterOrigin}/api/v3/onepanel/configuration`)),
    timeout,
  ]).then(({ clusterId: fetchedClusterId }) => {
      if (fetchedClusterId) {
        if (fetchedClusterId === clusterId) {
          return true;
        } else {
          console.error('util:validate-onepanel-connection: cluster id does not match');
          return false;
        }
      } else {
        console.error('util:validate-onepanel-connection: no cluster id available');
        return false;
      }
    })
    .catch(() => false);
}
