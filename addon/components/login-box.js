/**
 * A component when available login options should be presented
 *
 * @module components/login-box
 * @author Jakub Liput Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject, { computed } from '@ember/object';
import { inject } from '@ember/service';
import Component from '@ember/component';
import layout from 'onedata-gui-common/templates/components/login-box';
import safeMethodExecution from 'onedata-gui-common/utils/safe-method-execution';

export default Component.extend({
  layout,
  classNames: ['login-box'],

  globalNotify: inject(),
  session: inject(),

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
  sessionHasExpired: computed.alias('session.data.hasExpired'),

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
