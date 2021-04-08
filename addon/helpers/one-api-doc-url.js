/**
 * Generates URL to official Onedata API documentation for a given product and an optional
 * page anchor.
 *
 * For example for:
 * `product="oneprovider" anchor="tag/File-registration"`
 * generates:
 * `https://onedata.org/#/home/api/stable/oneprovider?anchor=tag/File-registration`
 *
 * @module helpers/one-api-doc-url
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { helper } from '@ember/component/helper';

const defaultVersion = 'stable';
const urlPrefix = 'https://onedata.org/#/home/api/';

/**
 * @param {String} urlSpec.product one of 'oneprovider', 'onezone' or 'onepanel' (or other
 * in the future)
 * @param {String} [urlSpec.anchor=undefined] page anchor. Example: 'tag/File-registration'
 * @returns {String}
 */
export function oneApiDocUrl(urlSpec) {
  let url = `${urlPrefix}${urlSpec.version || defaultVersion}/${urlSpec.product || ''}`;
  if (urlSpec.anchor) {
    url += `?anchor=${urlSpec.anchor}`;
  }

  return url;
}

export default helper((params, hash) => oneApiDocUrl(hash));
