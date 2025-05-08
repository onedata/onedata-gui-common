/**
 * Globally accessible resources for provider-related views.
 *
 * @author Jakub Liput
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service, { inject as service } from '@ember/service';
import ChunkableListModel from 'onedata-gui-common/utils/chunkable-list-model';
import { Mutex } from 'async-mutex';

export default class ProviderResourcesService extends Service {
  @service batchRequestRegistry;

  /**
   * Stores ChunkableListModel instances for particular providers to prevent multiple
   * fetching the same data.
   * @type {Map<Models.Provider, ChunkableListModel>}
   */
  chunkableSpaceListsCache = new Map();

  spaceListResolverMutex = new Mutex();

  /**
   * @param {Models.Provider} provider
   * @returns {Promise<ChunkableListModel>}
   */
  async resolveChunkableSpaceListModel(provider) {
    if (!provider) {
      throw new Error(
        'ProviderResources.resolveChunkableSpaceListModel: provider argument is mandatory'
      );
    }
    await this.spaceListResolverMutex.acquire();
    try {
      if (!this.chunkableSpaceListsCache.has(provider)) {
        const spaceList = await provider.spaceList;
        const chunkableListModel = new ChunkableListModel({
          listModel: spaceList,
          batchRequestRegistry: this.batchRequestRegistry,
        });
        this.chunkableSpaceListsCache.set(provider, chunkableListModel);
      }
      return this.chunkableSpaceListsCache.get(provider);
    } finally {
      this.spaceListResolverMutex.release();
    }
  }
}
