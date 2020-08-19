/**
 * Creates computed property computing convenient object with effective privileges flags,
 * that is intented to use with space model.
 * 
 * Values are true if user have permission, or either false or there is no privilege key
 * at all if user has no permission.
 * Keys of the object are camelCase space privileges eg. `viewQos`.
 * They are generated from given `allFlags` which are in format `space_some_privilege`,
 * eg. `space_view_qos` for previous example.
 * 
 * For Onedata GraphSync model, prototype space privileges flags are defined in `onedata-gui-websocket-client/addon/utils/space-privileges-flags.js`.
 * 
 * The computed property needs following properties in Ember Object:
 * - `currentUserEffPrivileges: PromiseProxyObject` - resolving with array of privileges
 *   that current user has
 * - `currentUserIsOwner: Boolean` - true if current GUI user is the owner of space
 * 
 * 
 * @param {Array<String>} `allFlags`
 * 
 * @module utils/computed-current-user-space-privileges
 * @author Jakub Liput
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { camelize } from '@ember/string';
import { computed } from '@ember/object';

function shortenCamelize(flag) {
  return camelize(flag.split('space_')[1]);
}

export default function computedCurrentUserSpacePrivileges(allFlags) {
  return computed('currentUserEffPrivileges.[]', 'currentUserIsOwner', function () {
    const {
      currentUserEffPrivileges,
      currentUserIsOwner,
    } = this.getProperties('currentUserEffPrivileges', 'currentUserIsOwner');
    const defaultValue = Boolean(currentUserIsOwner);
    const result = allFlags.reduce((tmpResult, flag) => {
      tmpResult[shortenCamelize(flag)] = defaultValue;
      return tmpResult;
    }, {});
    if (!currentUserIsOwner) {
      currentUserEffPrivileges.forEach(flag => {
        result[shortenCamelize(flag)] = true;
      }, {});
    }
    return result;
  });
}
export default function computedCurrentUserSpacePrivileges() {
  return true;
}
