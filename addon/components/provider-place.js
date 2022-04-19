/**
 * A circle representing a provider on world map.
 *
 * @module components/provider-place
 * @author Jakub Liput, Michal Borzecki
 * @copyright (C) 2017-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed, get, observer } from '@ember/object';
import { inject as service } from '@ember/service';
import { A, isArray } from '@ember/array';
import { next } from '@ember/runloop';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import $ from 'jquery';

import layout from 'onedata-gui-common/templates/components/provider-place';

export default Component.extend(I18n, {
  layout,
  classNames: ['provider-place'],
  classNameBindings: ['status'],

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.providerPlace',

  /**
   * A provider model that will be represented on map
   * To inject.
   * @type {Onezone.ProviderDetails|Array<Onezone.ProviderDetails>}
   */
  provider: null,

  /**
   * Parent atlas component width
   * @type {number}
   */
  atlasWidth: 0,

  /**
   * Scale factor for circle size
   * @type {number}
   */
  circleSizeScale: 1,

  /**
   * Circle color
   * @type {string}
   */
  circleColor: undefined,

  /**
   * @type {boolean}
   */
  active: false,

  /**
   * If true, drop is rendered after circle click
   * @type {boolean}
   */
  renderDrop: true,

  /**
   * @type {Onezone.ProviderDetails}
   */
  selectedProvider: undefined,

  /**
   * @type {function}
   * @param {Onezone.ProviderDetails} provider
   * @returns {undefined}
   */
  providerSelectedAction: () => {},

  /**
   * Array of providers
   * @type {Ember.ComputedProperty<Onezone.ProviderDetails>}
   */
  providersArray: computed('provider', function providersArray() {
    const provider = this.get('provider');
    return isArray(provider) ? A(provider) : A([provider]);
  }),

  /**
   * Component mode: single or multi
   * @type {Ember.ComputedProperty<string>}
   */
  mode: computed('providersArray.length', function mode() {
    return this.get('providersArray.length') > 1 ? 'multi' : 'single';
  }),

  /**
   * Provider status
   * @type {computed.string}
   */
  status: computed('providersArray.@each.status', function status() {
    const providersArray = this.get('providersArray');
    const statuses = [];
    providersArray.forEach(provider => {
      const s = get(provider, 'status');
      if (statuses.indexOf(s) === -1) {
        statuses.push(s);
      }
    });
    return statuses.length > 1 ? 'mixed' : statuses[0];
  }),

  /**
   * @type {string}
   */
  popoverPlacement: 'left',

  selectedProviderObserver: observer('selectedProvider', function () {
    const providerId = this.get('selectedProvider.id');
    next(() => {
      safeExec(this, () => {
        const providerElement = $(
          `[data-provider="${providerId}"].oneproviders-list-item`
        );
        if (providerElement.length > 0) {
          providerElement[0].scrollIntoView();
        }
      });
    });
  }),

  init() {
    this._super(...arguments);
    if (!this.get('selectedProvider')) {
      this.set('selectedProvider', this.get('providersArray').objectAt(0));
    }
  },

  didInsertElement() {
    this._super(...arguments);
    this.selectedProviderObserver();
  },

  actions: {
    selectProvider(provider) {
      this.get('providerSelectedAction')(provider);
    },
  },
});
