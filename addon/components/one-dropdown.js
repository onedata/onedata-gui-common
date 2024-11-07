/**
 * Custom extension of ember-power-select
 *
 * @author Michał Borzęcki, Jakub Liput
 * @copyright (C) 2020-2024 ACK CYFRONET AGH
 * @copyright (C) 2025 Onedata (onedata.org)
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import PowerSelect from 'ember-power-select/components/power-select';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import { inject as service } from '@ember/service';
import { computed, defineProperty } from '@ember/object';

export default class OneDropdown extends PowerSelect {
  @service scrollState;
  @service media;

  // FIXME: przełącznik boolean
  groupComponent = 'one-dropdown/one-dropdown-group';

  /**
   * @type {ScrollListener}
   */
  scrollListener;

  /** @type {string} */
  customGroupComponent;

  init() {
    super.init(...arguments);
    this.set('scrollListener', () => this.handlePageScroll());
    this.scrollState.addScrollListener(this.scrollListener);

    defineProperty(this, 'groupComponent', computed('areGroupsCollapsible', {
      get() {
        return this.customGroupComponent ?? (
          this.areGroupsCollapsible ?
          'one-dropdown/collapsible-group' : 'power-select/power-select-group'
        );
      },
      set(value) {
        this.set('customGroupComponent', value);
      },
    }));
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
