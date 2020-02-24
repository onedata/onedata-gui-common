/**
 * Check version of Oneprovider if it has non-embeddable GUI
 * 
 * @module utils/is-legacy-oneprovider
 * @author Jakub Liput
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import config from 'ember-get-config';

const {
  legacyOneproviderVersion,
} = config;

export default function isLegacyOneprovider(version) {
  return version && version.startsWith(legacyOneproviderVersion);
}
