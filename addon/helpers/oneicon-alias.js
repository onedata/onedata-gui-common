/**
 * Exposes oneicon-alias service functionality as a helper.
 * Accepts two arguments - context and keyword (see oneicon-alias
 * service documentation).
 * 
 * @module helpers/oneicon-alias
 * @author Michal Borzecki
 * @copyright (C) 2018-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Helper from '@ember/component/helper';
import { inject as service } from '@ember/service';

export default Helper.extend({
  oneiconAlias: service(),

  compute(params) {
    return this.get('oneiconAlias').getName(params[0], params[1]);
  },
});
