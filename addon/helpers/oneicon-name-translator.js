/**
 * Exposes oneicon-name-translator service functionality as a helper.
 * Accepts two arguments - context and keyword (see oneicon-name-translator
 * service documentation).
 * 
 * @module helpers/oneicon-name-translator
 * @author Michal Borzecki
 * @copyright (C) 2017-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Helper from '@ember/component/helper';
import { inject as service } from '@ember/service';

export default Helper.extend({
  oneiconNameTranslator: service(),

  compute(params) {
    return this.get('oneiconNameTranslator').getName(params[0], params[1]);
  }
});
