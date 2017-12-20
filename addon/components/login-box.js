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
import EmberObject from '@ember/object';
import safeMethodExecution from 'onedata-gui-common/utils/safe-method-execution';

const {
  inject: {
    service
  },
  computed: {
    alias,
  },
} = Ember;

export default Ember.Component.extend({
  layout,
  classNames: ['login-box'],

  globalNotify: service(),
  session: service(),

  /**
   * Description for error (if occurred).
   * @type {string|undefined}
   */
  errorMessage: undefined,

  /**
   * If true, data necessary to render login-box is still loading
   * @type {boolean}
   */
  isLoading: false,

  /**
   * Data object passed to the login-box header component
   * @type {EmberObject}
   */
  headerModel: undefined,

  isBusy: false,

  /**
   * True, if previous session has expired
   */
  sessionHasExpired: alias('session.data.hasExpired'),

  init() {
    this._super(...arguments);
    this.set('headerModel', EmberObject.create({}));
  },

  actions: {
    authenticationStarted() {
      this.set('isBusy', true);
    },

    authenticationSuccess() {
      this.get('globalNotify').info('Authentication succeeded!');
      safeMethodExecution(this, 'set', 'isBusy', false);
    },

    authenticationFailure() {
      safeMethodExecution(this, 'set', 'isBusy', false);
    }
  }
});
