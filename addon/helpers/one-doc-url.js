/**
 * Generates URL to official Onedata documentation for given relative document path.
 *
 * For example for:
 * `using_onedata/account_management[setting-user-alias].html`
 * generates:
 * `https://onedata.org/#/home/documentation/doc/21.02/using_onedata/account_management[setting-user-alias].html`
 *
 * @author Jakub Liput
 * @copyright (C) 2018-2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { observer } from '@ember/object';
import Helper from '@ember/component/helper';
import { inject as service } from '@ember/service';
import OwnerInjector from 'onedata-gui-common/mixins/owner-injector';

const fallbackDocsVersion = 'stable';

/**
 * Simplifies version numer to the one that is used in onedata.org homepage for
 * documentation.
 * @param {string} version For example: '21.02.3'
 * @returns {string|undefined} For example: '21.02'. Returns undefined if version is in
 *   unknown format (also applies for special 'stable' version).
 */
function simplifyVersion(version) {
  return version.match(/(\d+\.\d+)\.\d+/)?.[1];
}

const OneDocUrlHelper = Helper.extend({
  guiUtils: service(),

  versionObserver: observer(
    'guiUtils.softwareVersionDetails',
    function versionObserver() {
      this.recompute();
    }
  ),

  compute([path], { version } = {}) {
    let effVersion = version;
    if (!effVersion) {
      effVersion = this.guiUtils.softwareVersionDetails?.serviceVersion;
    }
    if (effVersion) {
      effVersion = simplifyVersion(effVersion);
    }
    if (!effVersion) {
      effVersion = fallbackDocsVersion;
    }
    return `https://onedata.org/#/home/documentation/${effVersion}/doc/${path}`;
  },
});

export const OneDocUrlHelperStandalone = OneDocUrlHelper.extend(OwnerInjector);

/**
 * Util function for simple URL generation in JS code.
 * @param {Object} owner Ember framework object, that contains information about owner.
 * @param {string} path Relative path to documentation page/section, eg.,
 *   `using_onedata/account_management[setting-user-alias].html`
 * @returns {string} Full URL to documentation page/secion, eg.,
 *   https://onedata.org/#/home/documentation/doc/21.02/using_onedata/account_management[setting-user-alias].html`
 */
export function oneDocUrl(owner, path) {
  return OneDocUrlHelperStandalone.create({ ownerSource: owner }).compute([path]);
}

export default OneDocUrlHelper;
