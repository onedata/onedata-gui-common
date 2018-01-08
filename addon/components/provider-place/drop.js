/**
 * A popover placed near to the provider-place circle element,
 * visible when clicked. Contains information about provider and its spaces.
 * 
 * @module components/provider-place-drop
 * @author Jakub Liput, Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';
import layout from 'onedata-gui-common/templates/components/provider-place/drop';

const {
  computed: {
    sort,
  },
  inject: {
    service,
  },
  computed,
  get,
} = Ember;

export default Ember.Component.extend({
  layout,
  classNames: 'provider-place-drop',
  classNameBindings: ['provider.status'],
  globalNotify: service(),
  i18n: service(),

  /**
   * Spaces list sort order
   * @type {Array.string}
   */
  _spacesSorting: ['isDefault:desc', 'name'],

  _spaceList: computed.reads('provider.spaceList'),

  /**
   * Sorted array of spaces
   * @type {Array.Onezone.SpaceDetails}
   */
  _spacesSorted: sort('_spaceList.list', '_spacesSorting'),

  _spacesLoaded: computed(
    '_spaceList.isLoaded',
    '_spaceList.list.isFulfilled',
    function () {
      const _spaceList = this.get('_spaceList');
      return !!(
        _spaceList &&
        get(_spaceList, 'isLoaded') &&
        get(_spaceList, 'list.isFulfilled')
      );
    }
  ),

  actions: {
    copySuccess() {
      let {
        i18n,
        globalNotify
      } = this.getProperties('i18n', 'globalNotify');

      globalNotify.info(i18n.t('components.providerPlace.drop.hostnameCopySuccess'));
    },

    copyError() {
      let {
        i18n,
        globalNotify
      } = this.getProperties('i18n', 'globalNotify');

      globalNotify.info(i18n.t('components.providerPlace.drop.hostnameCopyError'));
    }
  }
});
