/**
 * Creates computed property computing convenient object with effective privileges flags,
 * that is intented to use with space, group, cluster or harvester model.
 *
 * Values are true if user have permission, or either false or there is no privilege key
 * at all if user has no permission.
 * Keys of the object are camelCase privileges eg. `viewQos`.
 * They are generated from given `allFlags` which are in format `model_some_privilege`,
 * eg. `space_view_qos` for previous example for space model.
 *
 * For Onedata GraphSync model, prototype space privileges flags are defined in `onedata-gui-websocket-client/addon/utils/space-privileges-flags.js`.
 *
 * The computed property needs following properties in Ember Object by default:
 * - `currentUserEffPrivileges: PromiseProxyObject` - resolving with array of privileges
 *   that current user has
 * - `currentUserIsOwner: Boolean` - true if current GUI user is the owner of space
 *
 * Names of properties can be changed by passing `effPrivilegesProperty`
 * and `isOwnerProperty`.
 *
 * @param {Array<String>} `allFlags`
 *
 * @module utils/computed-current-user-privileges
 * @author Jakub Liput
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { camelize } from '@ember/string';
import { computed } from '@ember/object';

function shortenCamelize(flag, flagsPrefix) {
  const notifyError = () => console.warn(
    'util:computedCurrentUserPrivileges#shortenCamelize: invalid flag name',
    flag
  );

  if (flagsPrefix) {
    const prefixToCutOff = `${flagsPrefix}_`;
    const flagWithoutPrefix = flag.slice(prefixToCutOff.length);
    if (!flagWithoutPrefix || !flag.startsWith(prefixToCutOff)) {
      notifyError();
      return null;
    }
    return camelize(flagWithoutPrefix);
  }

  const m = flag.match('.*?_(.*)');
  if (!m) {
    notifyError();
  }
  return camelize(m ? m[1] : m);
}

export function currentUserPrivileges({
  allFlags,
  flagsPrefix,
  currentUserEffPrivileges,
  currentUserIsOwner,
}) {
  if (!currentUserEffPrivileges) {
    return null;
  }
  const defaultValue = Boolean(currentUserIsOwner);
  const result = allFlags.reduce((tmpResult, flag) => {
    tmpResult[shortenCamelize(flag, flagsPrefix)] = defaultValue;
    return tmpResult;
  }, {});
  if (!currentUserIsOwner) {
    currentUserEffPrivileges.forEach(flag => {
      result[shortenCamelize(flag, flagsPrefix)] = true;
    }, {});
  }
  return result;
}

export default function computedCurrentUserPrivileges({
  allFlags,
  flagsPrefix = undefined,
  effPrivilegesProperty = 'currentUserEffPrivileges',
  isOwnerProperty = 'currentUserIsOwner',
}) {
  return computed(
    `${effPrivilegesProperty}.[]`,
    isOwnerProperty,
    function getCurrentUserPrivileges() {
      return currentUserPrivileges({
        allFlags,
        flagsPrefix,
        currentUserEffPrivileges: this.get(effPrivilegesProperty),
        currentUserIsOwner: this.get(isOwnerProperty),
      });
    }
  );
}
