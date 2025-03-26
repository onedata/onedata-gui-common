/**
 * Custom extension of ember-power-select
 *
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import PowerSelect from 'ember-power-select/components/power-select';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';

export default class OneDropdown extends PowerSelect {
  @service scrollState;
  @service media;

  /**
   * @type {boolean}
   */
  isShowNoMessagesDisabled = false;

  /**
   * @type {ScrollListener}
   */
  scrollListener = undefined;

  /**
   * @override
   */
  @computed('search', 'publicAPI.{lastSearchedText,resultsCount,loading}')
  get mustShowNoMessages() {
    return !this.isShowNoMessagesDisabled &&
      !this.publicAPI.loading &&
      this.publicAPI.resultsCount === 0 &&
      (!this.search || this.publicAPI.lastSearchedText.length > 0);
  }

  init() {
    super.init(...arguments);
    this.set('scrollListener', () => this.handlePageScroll());
    this.scrollState.addScrollListener(this.scrollListener);
  }

  willDestroy() {
    super.willDestroy(...arguments);
    this.scrollState.removeScrollListener(this.scrollListener);
  }

  updateState() {
    return safeExec(this, () => super.updateState(...arguments));
  }

  set() {
    return safeExec(this, () => super.set(...arguments));
  }

  handlePageScroll() {
    if (!this.renderInPlace && this.publicAPI.isOpen) {
      if (this.media.isTablet || this.media.isMobile) {
        // In mobile mode dropdown may overlay top bar of the GUI. We need to hide dropdown
        // on scroll.
        this.publicAPI.actions?.close?.();
      } else {
        this.publicAPI.actions?.reposition?.();
      }
    }
  }
}
