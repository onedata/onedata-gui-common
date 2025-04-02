/**
 * A wrapper for resolving sidebar route model which contains sidebar collection.
 *
 * Provides progress info via injected ProgressTracker and OnedataSidebarRouteModel
 * creation. It is considered as a main model for SidebarLoadingContainerComponent.
 *
 * @author Jakub Liput
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { tracked } from '@glimmer/tracking';

export default class SidebarModelLoader {
  /** @type {ProgressTracker} */
  @tracked
  progressTracker;

  /** @type {Promise<SidebarCollection>} */
  #sidebarCollectionPromise;

  /** @type {OnedataResourceCategory} */
  #resourceCategory;

  /**
   * @param {OnedataResourceCategory} resourceCategory
   * @param {Promise<ChunkableListModelSidebarCollection>} sidebarCollectionPromise
   */
  constructor(resourceCategory, sidebarCollectionPromise) {
    if (typeof resourceCategory !== 'string') {
      throw new Error(
        'SidebarModelLoader.constructor: resourceCategory must be a string'
      );
    }
    if (typeof sidebarCollectionPromise?.then !== 'function') {
      throw new Error(
        'SidebarModelLoader.constructor: sidebarCollectionPromise must be a Promise'
      );
    }
    this.#resourceCategory = resourceCategory;
    this.#sidebarCollectionPromise = sidebarCollectionPromise;
  }

  get sidebarCollectionPromise() {
    return this.#sidebarCollectionPromise;
  }

  get resourceCategory() {
    return this.#resourceCategory;
  }

  /**
   * @returns {Promise<OnedataSidebarRouteModel>}
   */
  async resolveSidebarModel() {
    return {
      collection: await this.sidebarCollectionPromise,
      resourceType: this.resourceCategory,
    };
  }
}
