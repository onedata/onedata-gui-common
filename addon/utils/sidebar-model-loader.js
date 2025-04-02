// FIXME: jsdoc

import { tracked } from '@glimmer/tracking';

export default class SidebarModelLoader {
  /** @type {SidebarBatchProgress} */
  @tracked
  batchProgress;

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
   * @returns {OnedataSidebarRouteModel}
   */
  async resolveSidebarModel() {
    return {
      collection: await this.sidebarCollectionPromise,
      resourceType: this.resourceCategory,
    };
  }
}
