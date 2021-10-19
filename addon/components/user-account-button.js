/**
 * A button that allows to invoke various actions for current user account 
 *
 * @module components/user-account-button
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2017-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';

import { inject as service } from '@ember/service';
import { computed, observer } from '@ember/object';
import { next } from '@ember/runloop';
import layout from 'onedata-gui-common/templates/components/user-account-button';
import ClickOutside from 'ember-click-outside/mixins/click-outside';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';

export default Component.extend(ClickOutside, I18n, {
  layout,
  classNames: ['user-account-button'],
  classNameBindings: ['mobileMode:user-account-button-mobile'],

  privacyPolicyManager: service(),
  guiUtils: service(),
  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.userAccountButton',

  /**
   * @type {function}
   * @param {boolean} opened
   * @returns {undefined}
   */
  onMenuOpened: () => {},

  /**
   * @virtual
   * @type {function}
   * @param {string} [targetResourceType]
   * @returns {undefined}
   */
  onItemClick: notImplementedIgnore,

  menuOpen: false,

  mobileMode: false,

  /**
   * To implement for specific server-side implementation
   * @abstract
   */
  username: undefined,

  menuTriggerSelector: computed(function () {
    return `#${this.get('elementId')} .user-toggle-icon`;
  }),

  menuItemClasses: computed('mobileMode', function () {
    if (this.get('mobileMode')) {
      return 'one-list-item main-menu-item clickable truncate';
    } else {
      return 'one-list-item enabled clickable main-menu-item user-account-button-main';
    }
  }),

  menuOpenObserver: observer('menuOpen', function () {
    this.get('onMenuOpened')(this.get('menuOpen'));
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
      this.get('onItemClick')('users');
    },
    privacyPolicy() {
      this.set('menuOpen', false);
      this.get('onItemClick')('privacy-policy');
    },
    logout() {
      return this.get('guiUtils').logout().finally(() =>
        safeExec(this, 'set', 'menuOpen', false)
      );
    },
  },
});
