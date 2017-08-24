/**
 * A component that shows list of providers. It allows to:
 * * display provider icon using custom color (from provider.color property),
 * * notify about click on provider (by providerClickAction callback)
 * * notify about actual state of items filtration (by providersFilterAction
 *   callback)
 * * set custom actions for providers (using providerActions - 
 *   see property comment for more details)
 *
 * @module components/providers-list.js
 * @author Michał Borzęcki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';
import layout from 'onedata-gui-common/templates/components/providers-list';

const {
  computed,
  inject: {
    service,
  }
} = Ember;

export default Ember.Component.extend({
  layout,
  classNames: ['providers-list'],

  i18n: service(),

  /**
   * Title used in list header.
   * @type {string}
   */
  title: computed(function () {
    return this.get('i18n').t('components.providersList.providers');
  }),

  /**
   * Array of providers. ProviderDetails objects may include ``color`` property.
   * To inject.
   * @type {Array.Onezone.ProviderDetails}
   */
  providers: [],

  /**
   * Action called on providers filter.
   * @type {Function}
   */
  providersFilterAction: () => {},

  /**
   * Action called on provider click.
   * @type {Function}
   */
  providerClickAction: () => {},

  /**
   * Array of possible actions per provider. Each action must be in format: 
   * ```
   * {
   *   text: 'Action trigger text',
   *   action: someCallback,
   *   class: 'class-for-trigger-element,
   * }
   * ```
   * An actions will be displayed on the right side of the provider 
   * item as a popover. Provider object will be passed to the action 
   * callback as an argument.
   * @type {Array.Object}
   */
  providerActions: [],

  init() {
    this._super(...arguments);

    let {
      title,
      i18n,
    } = this.getProperties('title', 'i18n');
    if (!title) {
      this.set('title', i18n.t('components.providersList.title'));
    }
  },

  actions: {
    providersFilter(providers) {
      this.get('providersFilterAction')(providers);
    },
    providerClick(provider) {
      this.get('providerClickAction')(provider);
    },
  },
});
