/**
 * Generates URL to official Onedata documentation for given relative document path.
 *
 * For example for:
 * `using_onedata/account_management[setting-user-alias].html`
 * generates:
 * `https://onedata.org/#/home/documentation/doc/using_onedata/account_management[setting-user-alias].html`
 * 
 * @module helpers/one-doc-url
 * @author Jakub Liput
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { helper } from '@ember/component/helper';

const urlPrefix = 'https://onedata.org/#/home/documentation/doc/';

export function oneDocUrl(params /*, hash*/ ) {
  return `${urlPrefix}${params[0]}`;
}

export default helper(oneDocUrl);
