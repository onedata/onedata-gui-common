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

import Ember from 'ember';
import layout from 'onedata-gui-common/templates/components/one-tree/item/content';
import { invokeAction } from 'ember-invoke-action';

const {
  observer,
  on,
} = Ember;

export default Ember.Component.extend({
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
   * Action called, when header content contains (or not) specified 
   * search query.
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
  _hasSubtreeObserver: on('init', observer('hasSubtree', function () {
    this.set('click', this.get('hasSubtree') ? this._click : null);
  })),

  /**
   * Performs filter query search
   */
  _searchQueryObserver: on('didInsertElement', observer('searchQuery',
    'isSubtreeFilteredOut',
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
    })),

  _click() {
    invokeAction(this, '_showAction');
  },
});
