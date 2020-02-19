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
import { get, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import layout from 'onedata-gui-common/templates/components/provider-place/drop';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import { conditional, raw, promise } from 'ember-awesome-macros';
import getVisitOneproviderUrl from 'onedata-gui-common/utils/get-visit-oneprovider-url';

export default Component.extend(I18n, {
  layout,
  classNames: 'provider-place-drop',
  classNameBindings: ['oneproviderStatusClass'],

  globalNotify: service(),
  i18n: service(),
  guiUtils: service(),
  router: service(),

  /**
   * @virtual
   * @type {models.Provider}
   */
  provider: undefined,

  /**
   * @override
   */
  i18nPrefix: 'components.providerPlace.drop',

  providerVersionProxy: promise.object(computed(
    'provider.cluster.workerVersion.release',
    function providerVersionProxy() {
      const clusterPromise = this.get('provider.cluster');
      if (clusterPromise) {
        return clusterPromise.then(cluster =>
          get(cluster, 'workerVersion.release')
        );
      }
    }
  )),

  providerVersion: reads('providerVersionProxy.content'),

  oneproviderStatusClass: conditional(
    'provider.online',
    raw('online'),
    raw('offline')
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

  /**
   * @type {ComputedProperty<Models.Space>}
   */
  firstSpace: reads('_spacesSorted.firstObject'),

  visitProviderUrl: computed(
    'provider',
    'firstSpace.entityId',
    'providerVersionProxy.content',
    function visitProviderUrl() {
      const {
        guiUtils,
        provider,
        firstSpace,
        router,
        providerVersion,
      } = this.getProperties(
        'guiUtils',
        'provider',
        'firstSpace',
        'router',
        'providerVersion'
      );
      if (providerVersion) {
        return getVisitOneproviderUrl({
          guiUtils,
          router,
          provider,
          providerVersion,
          space: firstSpace,
        });
      }
    }
  ),

  actions: {
    copySuccess() {
      this.get('globalNotify').info(this.t('hostnameCopySuccess'));
    },

    copyError() {
      this.get('globalNotify').info(this.t('hostnameCopyError'));
    },
  }
});
