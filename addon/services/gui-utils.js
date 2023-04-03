// TODO: VFS-9257 fix eslint issues in this file
/* eslint-disable jsdoc/require-returns */

/**
 * Provides data and implementation of utils specific for gui,
 * that uses onedata-gui-common.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2018-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service from '@ember/service';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import modelRoutableId from 'onedata-gui-common/utils/model-routable-id';

export default Service.extend(I18n, {
  i18n: service(),
  globalNotify: service(),
  session: service(),

  /**
   * @override
   */
  i18nPrefix: 'services.guiUtils',

  /**
   * E.g. Onezone or Onepanel
   * @virtual
   * @type {Ember.ComputedProperty<string>}
   */
  guiType: computed(function () {
    return this.t('onedata');
  }),

  /**
   * E.g. zone name for Onezone.
   * @virtual
   * @type {string}
   */
  guiName: '',

  /**
   * Version of software. Currently only backend.
   * @virtual
   * @type {object} string properties: serviceVersion, serviceBuildVersion
   */
  softwareVersionDetails: Object.freeze({}),

  /**
   * Location of gui icon.
   * @virtual
   * @type {string}
   */
  guiIcon: '',

  /**
   * External link to manage account. If not needed (manage account is a
   * local aspect), then it should be empty.
   * @type {string|undefined}
   */
  manageAccountExternalLink: undefined,

  /**
   * Difference between global (backend) time and local browser time.
   * If > 0 then backend has "bigger" time.
   * @type {number}
   */
  globalTimeSecondsOffset: 0,

  /**
   * Text used as a label for 'manage account' item in menu. If empty, this item will be hidden.
   * @type {Ember.ComputedProperty<string>}
   */
  manageAccountText: computed(function manageAccountText() {
    return this.get('i18n').t('components.userAccountButton.manageAccount');
  }),

  /**
   * @param {object|string} model
   * @returns {string}
   */
  getRoutableIdFor(model) {
    return modelRoutableId(model);
  },

  /**
   * Full procedure of logout from GUI.
   * The success result should be showing unauthenticated login screen.
   * @returns {Promise}
   */
  logout() {
    const session = this.get('session');
    const loggingOut = session.invalidate();
    loggingOut.then(() =>
      window.location.href = this.getAfterLogoutRedirectUrl()
    );
    loggingOut.catch(error => {
      this.get('globalNotify').backendError(this.t('loggingOut'), error);
    });
    loggingOut.finally(() => this.set('menuOpen', false));
    return loggingOut;
  },

  /**
   * @returns {String
   */
  getAfterLogoutRedirectUrl() {
    // Redirect to main page with cleared out routing data
    // (these after '#' and '?' characters)
    return window.location.href.match(/(^[^#?]*)/)[0];
  },
});
