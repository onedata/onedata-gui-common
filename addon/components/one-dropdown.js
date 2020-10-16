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
import { observer } from '@ember/object';
import { inject as service } from '@ember/service';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';

export default PowerSelect.extend({
  scrollState: service(),

  scrollObserver: observer('scrollState.lastScrollEvent', function scrollObserver() {
    this.handlePageScroll();
  }),

  init() {
    this._super(...arguments);
    this.get('scrollState.lastScrollEvent');
  },

  updateState() {
    return safeExec(this, () => this._super(...arguments));
  },

  handlePageScroll() {
    if (!this.get('renderInPlace') && this.get('publicAPI.isOpen')) {
      (this.get('publicAPI.actions.reposition') || notImplementedIgnore)();
    }
  },
});
