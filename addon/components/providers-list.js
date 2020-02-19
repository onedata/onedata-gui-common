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
 * @author Michał Borzęcki, Jakub Liput
 * @copyright (C) 2017-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';

import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import layout from 'onedata-gui-common/templates/components/providers-list';

export default Component.extend({
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
   * Array of objects {provider, color}. 
   * To inject.
   * @type {Ember.Array.Object}
   */
  providersData: null,

  /**
   * If set, list will show additional information about that space support size
   * @type {Space}
   */
  selectedSpace: null,

  /**
   * If set to true, show support size provided for selected space
   * @type {boolean}
   */
  showSelectedSpaceSupportSize: true,

  /**
   * If set to true, show total supported spaces count
   * @type {boolean}
   */
  showSupportedSpacesCount: true,

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
  providerActions: Object.freeze([]),

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
      if (!document.querySelector('.oneprovider-actions.in')) {
        this.get('providerClickAction')(provider);
      }
    },
  },
});
