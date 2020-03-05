/**
 * Custom extension of ember-power-select
 *
 * @module components/one-dropdown
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import PowerSelect from 'ember-power-select/components/power-select';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';

export default PowerSelect.extend({
  updateState() {
    return safeExec(this, () => this._super(...arguments));
  },
});
