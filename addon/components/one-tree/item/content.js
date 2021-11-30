/**
 * A component used by one-tree. It represents tree item content. Example of
 * usage can be found in one-tree component comments.
 *
 * Can be used only as a contextual component yielded by one-tree/item.
 *
 * @module components/one-tree/item/content
 * @author Michal Borzecki
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
      } = this.getProperties(
        'searchQuery',
        'itemFilteredOut',
        'isSubtreeFilteredOut'
      );
      searchQuery = searchQuery.trim();

      // There is a priority of elements, where searchQuery should be searched:
      // .tree-label or .one-label or the whole content
      let textElement = this.$();
      let treeLabel = textElement.find('.tree-label');
      let oneLabel = textElement.find('.one-label');
      if (treeLabel.length) {
        textElement = treeLabel;
      } else if (oneLabel.length) {
        textElement = oneLabel;
      }

      let isNotFilteredOut = textElement.text().toLowerCase()
        .indexOf(searchQuery.toLowerCase()) > -1;
      if (searchQuery.length > 0 && !isSubtreeFilteredOut) {
        textElement.addClass('semibold');
      } else {
        textElement.removeClass('semibold');
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
