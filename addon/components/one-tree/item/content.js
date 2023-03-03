/**
 * A component used by one-tree. It represents tree item content. Example of
 * usage can be found in one-tree component comments.
 *
 * Can be used only as a contextual component yielded by one-tree/item.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';

import { observer } from '@ember/object';
import layout from 'onedata-gui-common/templates/components/one-tree/item/content';

export default Component.extend({
  layout,
  classNames: ['one-tree-item-content'],

  /**
   * Action callback that shows item subtree
   * @type {Function}
   */
  _showAction: null,

  /**
   * If true, item has a subtree
   * @type {boolean}
   */
  hasSubtree: false,

  /**
   * Action called, when header content contains (or not) specified.
   * search query. Signature:
   * * isVisible {boolean} is item visible (not filtered out)
   * @type {Function}
   */
  itemFilteredOut: () => {},

  /**
   * If true, item subtree is filtered out
   * @type {boolean}
   */
  isSubtreeFilteredOut: false,

  /**
   * Search query.
   * @type {string}
   */
  searchQuery: '',

  /**
   * Toggles click handler.
   */
  _hasSubtreeObserver: observer('hasSubtree', function () {
    this.set('click', this.get('hasSubtree') ? this._click : null);
  }),

  /**
   * Performs filter query search
   */
  _searchQueryObserver: observer('searchQuery', 'isSubtreeFilteredOut',
    function () {
      let {
        searchQuery,
        itemFilteredOut,
        isSubtreeFilteredOut,
        element,
      } = this.getProperties(
        'searchQuery',
        'itemFilteredOut',
        'isSubtreeFilteredOut',
        'element'
      );
      searchQuery = searchQuery.trim();

      // There is a priority of elements, where searchQuery should be searched:
      // .tree-label or .one-label or the whole content
      let textElement = element;
      const treeLabel = textElement.querySelector('.tree-label');
      const oneLabel = textElement.querySelector('.one-label');
      if (treeLabel) {
        textElement = treeLabel;
      } else if (oneLabel) {
        textElement = oneLabel;
      }

      const isNotFilteredOut = textElement.textContent.toLowerCase()
        .indexOf(searchQuery.toLowerCase()) > -1;
      if (searchQuery.length > 0 && !isSubtreeFilteredOut) {
        textElement.classList.add('semibold');
      } else {
        textElement.classList.remove('semibold');
      }
      itemFilteredOut(isNotFilteredOut);
    }
  ),

  init() {
    this._super(...arguments);
    this._hasSubtreeObserver();
  },

  didInsertElement() {
    this._super(...arguments);
    this._searchQueryObserver();
  },

  _click() {
    const _showAction = this.get('_showAction');
    if (_showAction) {
      _showAction();
    }
  },
});
