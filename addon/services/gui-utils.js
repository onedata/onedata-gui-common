/**
 * Provides data and implementation of utils specific for gui,
 * that uses onedata-gui-common.
 *
 * @module services/gui-utils
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service from '@ember/service';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject } from '@ember/service';
import { computed } from '@ember/object';
import modelRoutableId from 'onedata-gui-common/utils/model-routable-id';
import notImplementedReject from 'onedata-gui-common/utils/not-implemented-reject';

export default Service.extend(I18n, {
  i18n: inject(),

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
   * @virtual
   * Entity ID of default provider or null if no default or not available
   * @type {Ember.ComputedProperty<string>}
   */
  defaultProviderId: computed(function () {
    return null;
  }),

  /**
   * E.g. zone name for Onezone. 
   * @virtual
   * @type {string}
   */
  guiName: '',

  /**
   * Version of gui.
   * @virtual
   * @type {string}
   */
  guiVersion: '',

  /**
   * Location of gui icon.
   * @virtual
   * @type {string}
   */
  guiIcon: '',

  /**
   * @type {function}
   * @param {string} providerEntityId
   * @returns {Promise<undefined|any>}
   */
  setDefaultProviderId: notImplementedReject,

  /**
   * @param {object|string} model
   * @returns {string}
   */
  getRoutableIdFor(model) {
    return modelRoutableId(model);
  }
});
