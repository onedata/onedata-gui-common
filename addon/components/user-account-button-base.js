/**
 * A button that allows to invoke various actions for current user account
 *
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2017-2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed, observer } from '@ember/object';
import { next } from '@ember/runloop';
import layout from 'onedata-gui-common/templates/components/user-account-button-base';
import ClickOutside from 'ember-click-outside/mixin';
import I18n from 'onedata-gui-common/mixins/i18n';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';

export const menuItemClassesDesktop =
  'one-list-item enabled clickable main-menu-item user-account-button-main';

export const menuItemClassesMobile =
  'one-list-item main-menu-item clickable truncate';

export default Component.extend(ClickOutside, I18n, {
  layout,
  classNames: ['user-account-button-base', 'user-account-button'],
  classNameBindings: ['mobileMode:user-account-button-mobile'],

  guiMessageManager: service(),
  guiUtils: service(),
  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.userAccountButtonBase',

  /**
   * @virtual
   * @type {boolean}
   */
  isActive: undefined,

  /**
   * @virtual
   * To implement for specific server-side implementation
   */
  username: undefined,

  /**
   * @virtual optional
   * @type {(opened: boolean) => void}
   */
  onMenuOpened: undefined,

  /**
   * @virtual optional
   * @type {(targetResourceType: string) => void}
   */
  onItemClick: undefined,

  /**
   * @virtual optional
   * @type {boolean}
   */
  mobileMode: false,

  //#region state

  menuOpen: false,

  //#endregion

  menuTriggerSelector: computed(function menuTriggerSelector() {
    return `#${this.elementId} .user-toggle-icon`;
  }),

  menuItemClasses: computed('mobileMode', function menuItemClasses() {
    return this.mobileMode ? menuItemClassesMobile : menuItemClassesDesktop;
  }),

  menuOpenObserver: observer('menuOpen', function menuOpenObserver() {
    this.onMenuOpened?.(this.menuOpen);
  }),

  didInsertElement() {
    this._super(...arguments);
    next(this, this.addClickOutsideListener);
  },

  willDestroyElement() {
    try {
      this.removeClickOutsideListener();
    } finally {
      this._super(...arguments);
    }
  },

  clickOutside() {
    this.set('menuOpen', false);
  },

  actions: {
    toggleMenu() {
      this.toggleProperty('menuOpen');
    },
    // TODO handle error if manage account cannot be displayed
    manageAccount() {
      this.set('menuOpen', false);
      this.onItemClick?.('users');
    },
    privacyPolicy() {
      this.set('menuOpen', false);
      this.onItemClick?.();
    },
    termsOfUse() {
      this.set('menuOpen', false);
      this.onItemClick?.();
    },
    logout() {
      return this.guiUtils.logout().finally(() =>
        safeExec(this, 'set', 'menuOpen', false)
      );
    },
  },
});
