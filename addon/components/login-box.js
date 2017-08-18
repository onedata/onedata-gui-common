/**
 * A component when available login options should be presented
 *
 * @module components/login-box
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';
import layout from 'onedata-gui-common/templates/components/login-box';

const {
  inject: {
    service
  },
  computed,
  computed: {
    alias,
  },
} = Ember;

export default Ember.Component.extend({
  layout,
  classNames: ['login-box'],

  globalNotify: service(),
  session: service(),

  isBusy: false,

  /**
   * True, if previous session has expired
   */
  sessionHasExpired: alias('session.data.hasExpired'),

  /**
   * Class added to login-main-title element
   * Can be used to display some secondary image
   * @type {string}
   */
  loginMainTitleClass: '',

  /**
   * Main title of login view
   * Typically, should be overriden in subclasses
   * Alternatively, locale: ``components.loginBox.brandTitle`` can be set
   * @type {string}
   */
  brandTitle: computed(function () {
    return this.get('i18n').t('components.loginBox.brandTitle');
  }),

  /**
   * Subtitle of login view
   * Typically, should be overriden in subclasses
   * Alternatively, locale: ``components.loginBox.brandSubtitle`` can be set
   * @type {string}
   */
  brandSubtitle: computed(function () {
    return this.get('i18n').t('components.loginBox.brandSubtitle');
  }),

  actions: {
    authenticationStarted() {
      this.set('isBusy', true);
    },

    authenticationSuccess() {
      this.get('globalNotify').info('Authentication succeeded!');
      this.set('isBusy', false);
    },

    authenticationFailure() {
      this.set('isBusy', false);
    }
  }
});
