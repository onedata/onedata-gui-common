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
import { observer, getProperties } from '@ember/object';
import { inject as service } from '@ember/service';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';

export default PowerSelect.extend({
  scrollState: service(),
  media: service(),

  scrollObserver: observer('scrollState.lastScrollEvent', function scrollObserver() {
    this.handlePageScroll();
  }),

  init() {
    this._super(...arguments);

    // Enable observers
    this.get('scrollState.lastScrollEvent');
  },

  updateState() {
    return safeExec(this, () => this._super(...arguments));
  },

  handlePageScroll() {
    if (!this.get('renderInPlace') && this.get('publicAPI.isOpen')) {
      const {
        isTablet,
        isMobile,
      } = getProperties(this.get('media'), 'isTablet', 'isMobile');
      if (isTablet || isMobile) {
        // In mobile mode dropdown may overlay top bar of the GUI. We need to hide dropdown
        // on scroll.
        (this.get('publicAPI.actions.close') || notImplementedIgnore)();
      } else {
        (this.get('publicAPI.actions.reposition') || notImplementedIgnore)();
      }
    }
  },
});
