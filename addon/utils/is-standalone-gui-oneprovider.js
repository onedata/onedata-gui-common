/**
 * Check version of Oneprovider if it has non-embeddable GUI
 * 
 * @module utils/is-standalone-gui-oneprovider
 * @author Jakub Liput
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

export const standaloneGuiOneproviderVersion = '19.02';

export default function isStandaloneGuiOneprovider(version) {
  return version && version.startsWith(standaloneGuiOneproviderVersion);
}
