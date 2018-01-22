/**
 * A button that allows to invoke various actions for current user account 
 *
 * @module components/user-account-button
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';

import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { on } from '@ember/object/evented';
import { next } from '@ember/runloop';
import layout from 'onedata-gui-common/templates/components/user-account-button';
import { invokeAction } from 'ember-invoke-action';
import ClickOutside from 'ember-click-outside/mixins/click-outside';

export default Component.extend(ClickOutside, {
  layout,
  classNames: ['user-account-button'],
  classNameBindings: ['mobileMode:user-account-button-mobile'],

  session: service(),
  globalNotify: service(),

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

  _attachClickOutsideHandler: on('didInsertElement', function () {
    next(this, this.addClickOutsideListener);
  }),

  _removeClickOutsideHandler: on('willDestroyElement', function () {
    this.removeClickOutsideListener();
  }),

  clickOutside() {
    this.set('menuOpen', false);
  },

  actions: {
    toggleMenu() {
      this.toggleProperty('menuOpen');
    },
    // TODO handle error if manage account cannot be displayed
    manageAccount() {
      invokeAction(this, 'manageAccount');
      this.set('menuOpen', false);
    },
    logout() {
      let session = this.get('session');
      let loggingOut = session.invalidate();
      loggingOut.then(() => window.location.reload());
      loggingOut.catch(error => {
        this.get('globalNotify').backendError('logging out', error);
      });
      loggingOut.finally(() => this.set('menuOpen', false));
      return loggingOut;
    },
  },
});
