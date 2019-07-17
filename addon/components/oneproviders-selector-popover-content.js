/**
 * Shows list o Oneproviders, that should be placed inside popover. Allows
 * selecting and filtering.
 *
 * @module components/oneproviders-selector-popover-content
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from '../templates/components/oneproviders-selector-popover-content';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { computed, get } from '@ember/object';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import { inject as service } from '@ember/service';

export default Component.extend(I18n, {
  layout,
  classNames: ['oneproviders-selector-popover-content'],

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.oneprovidersSelectorPopoverContent',

  /**
   * @virtual
   * @type {Array<Models.Provider>}
   */
  oneproviders: undefined,

  /**
   * @type {Models.Provider}
   */
  selectedOneprovider: undefined,

  /**
   * @virtual
   * @type {Function}
   * @param {Models.Provider} oneprovider
   * @returns {undefined}
   */
  onOneproviderSelected: notImplementedIgnore,

  /**
   * @type {string}
   */
  query: undefined,

  /**
   * Filtered array of oneproviders
   * @type {Ember.ComputedProperty<Models.Provider>}
   */
  filteredOneproviders: computed(
    'oneproviders.@each.name',
    'query',
    function filteredOneproviders() {
      let {
        oneproviders,
        query,
      } = this.getProperties('oneproviders', 'query');
      query = (query || '').toLocaleLowerCase();

      return oneproviders
        .filter(provider => {
          const name = get(provider, 'name') || '';
          return name.toLocaleLowerCase().indexOf(query) !== -1;
        });
    }
  ),

  actions: {
    queryChanged(query) {
      this.set('query', query);
    },
  },
});
