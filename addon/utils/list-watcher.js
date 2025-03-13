/**
 * Instance of this class is bound to some `$container`.
 * When scrolling the container, we check which of elements (filtered by selector)
 * inside container are visible in view port.
 *
 * @author Jakub Liput
 * @copyright (C) 2018-2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import ViewTester from 'onedata-gui-common/utils/view-tester';

import config from 'ember-get-config';

const isThrowingOnWarning = config.environment !== 'production';

export default class ListWatcher {
  /**
   * @param {jQuery} $container
   * @param {String} itemsSelector
   * @param {(visibleElements: Element[], headerVisible: boolean, event: Event) => undefined} callback
   * @param {string} [topSelector]
   */
  constructor($container, itemsSelector, callback, topSelector) {
    this.$container = $container;
    this.itemsSelector = itemsSelector;
    this.topSelector = topSelector;
    this.callback = callback;
    this._scrollHandler = this.scrollHandler.bind(this);
    this.viewTester = new ViewTester($container);
    /** @type {Set<ListWatcherLock>} */
    this.handlerLocks = new Set();

    /** @type {HTMLElement} */
    const element = $container[0];
    if (element) {
      element.addEventListener('scroll', this._scrollHandler);
    } else {
      const message = 'ListWatcher.constructor: scroll container element not found';
      if (isThrowingOnWarning) {
        throw new Error(message);
      } else {
        console.error(message);
      }
    }
  }

  /**
   * @returns {ListWatcherLock}
   */
  lock() {
    return new ListWatcherLock(this);
  }

  /**
   * @returns {boolean}
   */
  isLocked() {
    return Boolean(this.handlerLocks.size);
  }

  scrollHandler(event) {
    if (this.isLocked()) {
      console.debug('ListWatcher.scrollHandler: scroll event ignored due to lock');
      return;
    }
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
    /** @type {HTMLElement} */
    const element = this.$container[0];
    element?.removeEventListener('scroll', this._scrollHandler);
  }
}

/**
 * Instance creation of this class adds a scroll handler lock to the selected ListWatcher.
 * The lock can be removed using `.unlock()` method.
 * The ListWatcher will ignore any scroll events until all locks registered in it will be
 * unlocked.
 */
class ListWatcherLock {
  /**
   * @param {ListWatcher} listWatcher
   */
  constructor(listWatcher) {
    /** @type {ListWatcher} */
    this.listWatcher = listWatcher;
    this.listWatcher.handlerLocks.add(this);
  }

  isActive() {
    return this.listWatcher.handlerLocks.has(this);
  }

  /**
   * @returns {boolean} True if lock was active and has been unlocked. False if it was not
   *   locked.
   */
  unlock() {
    return this.listWatcher.handlerLocks.delete(this);
  }
}
