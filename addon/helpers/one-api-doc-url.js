/**
 * Generates URL to official Onedata API documentation for a given product and an optional
 * page.
 *
 * For example for:
 * `product="oneprovider" page="tag/user"`
 * generates:
 * `https://onedata.org/api/stable/onezone/tag/user`
 *
 * @author Michał Borzęcki, Jakub Liput
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @copyright (C) 2026 Onedata (onedata.org)
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Helper from '@ember/component/helper';
import { inject as service } from '@ember/service';

const stableVersion = 'stable';
const urlPrefix = 'https://onedata.org/api/';

/**
 * @typedef {Object} ApiUrlSpec
 * @property {import('../services/gui-utils').ProductType} product
 * @property {string} version Version of Onedata product, you can use:
 *   - "stable" - the newest non-alpha/beta version of latest version branch
 *   - "latest" - the newest alpha, beta or stable version of latest version branch
 *   - /specific version number/ - eg. "25.0", "20.02.7", "21.02.0-alpha6" etc., you can
 *     check currently available versions entering https://onedata.org/api in
 *     and opening versions dropdown.
 * @property {string} path Specific page path, e.g., "operation/modify_provider",
 *   "tag/file-registration"
 */

export default class OneApiDocUrlHelper extends Helper {
  @service guiUtils;

  /**
   * @param {Array} positional Not used positional arguments.
   * @param {ApiUrlSpec} urlSpec
   * @returns {string}
   */
  compute(positional, urlSpec) {
    const version = urlSpec.version ||
      this.guiUtils.softwareVersionDetails?.serviceVersion ||
      stableVersion;
    const product = urlSpec.product || this.guiUtils.productTypeId;
    let url = `${urlPrefix}${version || stableVersion}/${product}`;
    if (urlSpec.path) {
      url += `/${urlSpec.path}`;
    }
    return url;
  }
}
