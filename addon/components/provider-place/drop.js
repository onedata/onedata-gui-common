/**
 * A popover placed near to the provider-place circle element,
 * visible when clicked. Contains information about provider and its spaces.
 * 
 * @module components/provider-place-drop
 * @author Jakub Liput, Michal Borzecki
 * @copyright (C) 2017-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';

import { sort, reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { get, computed } from '@ember/object';
import layout from 'onedata-gui-common/templates/components/provider-place/drop';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  layout,
  classNames: 'provider-place-drop',
  classNameBindings: ['provider.status'],
  globalNotify: service(),
  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.providerPlace.drop',

  /**
   * Spaces list sort order
   * @type {Array<string>}
   */
  _spacesSorting: Object.freeze(['isDefault:desc', 'name']),

  /**
   * One-way alias to space list record
   * @type {Ember.Computed<models/SpaceList>}
   */
  _spaceList: reads('provider.spaceList'),

  /**
   * Sorted array of spaces
   * @type {Array<models/Space>}
   */
  _spacesSorted: sort('_spaceList.list', '_spacesSorting'),

  /**
   * True if data for each space of provider is loaded (eg. support info)
   * @type {Ember.Computed<boolean>}
   */
  _spacesLoaded: computed('_spaceList.{isLoaded,list.isFulfilled}',
    function _getSpacesLoaded() {
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
      this.get('globalNotify').info(this.t('hostnameCopySuccess'));
    },

    copyError() {
      this.get('globalNotify').info(this.t('hostnameCopyError'));
    }
  }
});
