/**
 * Simulates fetch function for getting infinite scroll data with source from the
 * ListModel.
 *
 * @author Jakub Liput
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject, { computed } from '@ember/object';

/**
 * @typedef {Object} VirtualListFetcherItem
 * @property {string} index
 */

export default class VirtualListReloader extends EmberObject {
  listSortKey = 'index';

  /**
   * @virtual
   * @type {GraphListModel}
   */
  listModel = undefined;

  @computed
  get observedProperty() {
    return `listModel.list.@each.${this.listSortKey}`;
  }

  /** @override */
  init() {
    super.init(...arguments);
    this.addObserver(this.observedProperty, this, 'onListChanged', false);
  }

  /** @override */
  willDestroy() {
    super.willDestroy(...arguments);
    this.removeObserver(this.observedProperty, this, 'onListChanged', false);
  }

  async onListChanged() {
    await this.chunksArray?.scheduleReload();
  }
}
