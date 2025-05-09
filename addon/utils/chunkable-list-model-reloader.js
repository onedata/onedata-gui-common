/**
 * Simulates fetch function for getting infinite scroll data with source from the
 * ListModel.
 *
 * @author Jakub Liput
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject, { computed } from '@ember/object';

export default class VirtualListReloader extends EmberObject {
  /**
   * @virtual
   * @type {GraphListModel}
   */
  listModel = undefined;

  listSortKey = 'index';

  /**
   * Size of chunks array that will be set when reload is done with reset flag.
   * Should be the same as `initialArraySize` of ChunkableListModel to produce list
   * of similar length to initial list after reset.
   * @type {number}
   */
  initialArraySize = 50;

  /**
   * @virtual optional
   * @type {() => Promise<void>|void}
   */
  onListChanged = undefined;

  @computed
  get observedProperty() {
    return `listModel.list.@each.${this.listSortKey}`;
  }

  /** @override */
  init() {
    super.init(...arguments);
    this.addObserver(this.observedProperty, this, 'handleListChange', false);
  }

  /** @override */
  willDestroy() {
    super.willDestroy(...arguments);
    this.removeObserver(this.observedProperty, this, 'handleListChange', false);
  }

  /**
   * @param {boolean} reset If set to true, the list will be reloaded from start to the
   *   initial length (like the new array), forgetting about previous start/end indexes.
   * @returns {Promise<void>}
   */
  async handleListChange({ reset = false }) {
    if (this.chunksArray) {
      if (reset) {
        this.chunksArray.setIndices(0, this.initialArraySize);
      }
      await this.chunksArray.scheduleReload();
      await this.chunksArray.startChanged();
    }
    await this.onListChanged?.();
  }
}
