/**
 * Returns id for passed model, that can be used for routing purposes
 * (inside link-to helper etc).
 *
 * @author Michał Borzęcki
 * @copyright (C) 2018-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Helper from '@ember/component/helper';
import { inject } from '@ember/service';

export default Helper.extend({
  guiUtils: inject(),

  compute(params) {
    return this.get('guiUtils').getRoutableIdFor(params[0]);
  },
});
