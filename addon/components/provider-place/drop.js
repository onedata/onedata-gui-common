/**
 * A popover placed near to the provider-place circle element,
 * visible when clicked. Contains information about provider and its spaces.
 *
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2017-2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';

import { sort, reads } from '@ember/object/computed';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import layout from 'onedata-gui-common/templates/components/provider-place/drop';
import I18n from 'onedata-gui-common/mixins/i18n';
import { conditional, raw } from 'ember-awesome-macros';
import getVisitOneproviderUrl from 'onedata-gui-common/utils/get-visit-oneprovider-url';
import { promiseObject } from 'onedata-gui-common/utils/ember/promise-object';
import InfiniteScroll from 'onedata-gui-common/utils/infinite-scroll';

export default Component.extend(I18n, {
  layout,
  classNames: 'provider-place-drop',
  classNameBindings: ['oneproviderStatusClass'],

  globalNotify: service(),
  i18n: service(),
  guiUtils: service(),
  router: service(),
  providerResources: service(),

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
   * Spaces list sort order
   * @type {Array<string>}
   */
  spacesSorting: Object.freeze(['name']),

  /**
   * @type {Utils.InfiniteScroll}
   */
  infiniteScroll: undefined,

  providerVersion: reads('provider.version'),

  oneproviderStatusClass: conditional(
    'provider.online',
    raw('online'),
    raw('offline')
  ),

  /**
   * True if data for each space of provider is loaded (eg. support info)
   * @type {Ember.ComputedProperty<boolean>}
   */
  isListLoading: reads('listProxy.isPending'),

  /**
   * Sorted array of spaces
   * @type {Ember.ComputedProperty<Array<Models.Space>>}
   */
  spacesSorted: sort('spaces', 'spacesSorting'),

  /**
   * @type {ComputedProperty<Models.Space>}
   */
  firstSpace: reads('spacesSorted.firstObject'),

  visitProviderUrl: computed(
    'provider',
    'firstSpace.entityId',
    'providerVersion',
    function visitProviderUrl() {
      const {
        guiUtils,
        provider,
        firstSpace,
        router,
        providerVersion,
      } = this;
      if (firstSpace && providerVersion) {
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

  chunkableListModelProxy: computed('provider', function chunkableListModelProxy() {
    return promiseObject(
      this.providerResources.resolveChunkableSpaceListModel(this.provider)
    );
  }),

  chunkableListModel: reads('chunkableListModelProxy.content'),

  spaceListLoadingLabel: computed(
    'chunkableListModel.progressTracker.progress',
    function spaceListLoadingLabel() {
      if (!this.chunkableListModel?.progressTracker) {
        return this.t('loadingSpaces');
      }
      const percentage = Math.floor(
        (this.chunkableListModel.progressTracker.progress || 0) * 100
      );
      return this.t('loadingSpacesPercentage', {
        percentage: percentage,
      });
    }
  ),

  isVisitProviderButtonShown: computed(
    'isListLoading',
    function isVisitProviderButtonShown() {
      return !this.isListLoading;
    }
  ),

  listProxy: computed('chunkableListModelProxy', function listProxy() {
    const promise = (async () => {
      const chunkableListModel = await this.chunkableListModelProxy;
      await chunkableListModel.chunksArray.initialLoad;
      return chunkableListModel.chunksArray;
    })();
    return promiseObject(promise);
  }),

  spaces: reads('listProxy.content'),

  didInsertElement() {
    this._super(...arguments);
    (async () => {
      const chunksArray = await this.listProxy;
      const infiniteScroll = InfiniteScroll.create({
        entries: chunksArray,
        // Should be the same as .provider-place-drop-space height style.
        singleRowHeight: 28,
      });
      this.set('infiniteScroll', infiniteScroll);
      infiniteScroll.mount(this.element.querySelector('.space-list-scroll-container'));
    })();
  },

  /**
   * @override
   */
  willDestroy() {
    try {
      this.infiniteScroll?.destroy();
    } finally {
      this._super(...arguments);
    }
  },

  actions: {
    copySuccess() {
      this.globalNotify.info(this.t('hostnameCopySuccess'));
    },

    copyError() {
      this.globalNotify.info(this.t('hostnameCopyError'));
    },
  },
});
