// TODO: VFS-9257 fix eslint issues in this file
/* eslint-disable jsdoc/require-returns */

/**
 * Instance of this class is bound to some `$container`.
 * When scrolling the container, we check which of elements (filtered by selector)
 * inside container are visible in view port.
 *
 * @module utils/list-watcher
 * @author Jakub Liput
 * @copyright (C) 2018-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import ViewTester from 'onedata-gui-common/utils/view-tester';

export default class ListWatcher {
  /**
   * @param {jQuery} $container
   * @param {String} itemsSelector
   * @param {(visibleElements: Element[], headerVisible: boolean, event: Event) => undefined} callback
   */
  constructor($container, itemsSelector, callback, topSelector) {
    this.$container = $container;
    this.itemsSelector = itemsSelector;
    this.topSelector = topSelector;
    this.callback = callback;
    this._scrollHandler = this.scrollHandler.bind(this);
    this.viewTester = new ViewTester($container);

    $container.on('scroll', this._scrollHandler);
  }

  scrollHandler(event) {
    const items = this.$container.find(this.itemsSelector).toArray();
    let visibleFragment = false;
    const visibleElements = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const visible = this.viewTester.isInView(item);
      if (visible) {
        visibleElements.push(item);
        visibleFragment = true;
      } else if (visibleFragment) {
        break;
      }
    }

    let headerVisible = undefined;
    if (this.topSelector) {
      const topElement = this.$container.find(this.topSelector)[0];
      headerVisible = topElement && this.viewTester.isInView(topElement);
    }

    this.callback(visibleElements, headerVisible, event);
  }

  destroy() {
    this.$container.off('scroll', this._scrollHandler);
  }
}
