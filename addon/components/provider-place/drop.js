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
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import layout from 'onedata-gui-common/templates/components/provider-place/drop';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';

export default Component.extend(I18n, {
  layout,
  classNames: 'provider-place-drop',
  classNameBindings: ['provider.status'],
  globalNotify: service(),
  i18n: service(),
  guiUtils: service(),

  /**
   * @virtual
   * @type {models.Provider}
   */
  provider: undefined,

  /**
   * @override
   */
  i18nPrefix: 'components.providerPlace.drop',

  /**
   * @type {Ember.ComputedProperty<boolean|undefined>}
   */
  isDefaultProvider: computed(
    'guiUtils.defaultProviderId',
    'provider.entityId',
    function getIsDefaultProvider() {
      return this.get('guiUtils.defaultProviderId') === this.get('provider.entityId');
    },
  ),

  /**
   * Spaces list sort order
   * @type {Array<string>}
   */
  _spacesSorting: Object.freeze(['isDefault:desc', 'name']),

  /**
   * PromiseObject proxy to the list of spaces.
   * @type {Ember.ComputedProperty<PromiseObject<Array<Space>>>}
   */
  _spaceListProxy: computed('provider', function () {
    const provider = this.get('provider');
    return PromiseObject.create({
      promise: provider.get('spaceList.list'),
    });
  }),

  /**
   * Error occurred while loading list of spaces.
   * @type {*}
   */
  _spaceListError: reads('_spaceListProxy.reason'),

  /**
   * True if data for each space of provider is loaded (eg. support info)
   * @type {Ember.ComputedProperty<boolean>}
   */
  _spacesLoading: reads('_spaceListProxy.isPending'),

  /**
   * One-way alias to space list record
   * @type {Ember.ComputedProperty<Array<models/Space><}
   */
  _spaceList: reads('_spaceListProxy.content'),

  /**
   * Sorted array of spaces
   * @type {Ember.ComputedProperty<Array<models/Space>>}
   */
  _spacesSorted: sort('_spaceList', '_spacesSorting'),

  actions: {
    copySuccess() {
      this.get('globalNotify').info(this.t('hostnameCopySuccess'));
    },

    copyError() {
      this.get('globalNotify').info(this.t('hostnameCopyError'));
    },

    toggleDefaultProvider() {
      const isDefaultProvider = this.get('isDefaultProvider');
      return this.get('guiUtils')
        .setDefaultProviderId(isDefaultProvider ? null : this.get('provider.entityId'));
    },
  }
});
