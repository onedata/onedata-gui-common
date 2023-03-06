/**
 * Extends ember object with plain copy method - see `util:plain-copy` for
 * details.
 *
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

// Original implementation: http://stackoverflow.com/a/15002755

import Mixin from '@ember/object/mixin';
import plainCopy from 'onedata-gui-common/utils/plain-copy';

export default Mixin.create({
  plainCopy: function () {
    return plainCopy(this);
  },
});
