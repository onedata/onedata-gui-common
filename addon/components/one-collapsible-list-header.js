/**
 * List header class of the collapsible list. For example of use case see 
 * components/one-collapsible-list.js.
 *  
 * Yields in place, where action buttons can be rendered
 *
 * @module components/one-collapsible-list-header.js
 * @author Michał Borzęcki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import OneCollapsibleListItemHeader from 'onedata-gui-common/components/one-collapsible-list-item-header';

import layout from 'onedata-gui-common/templates/components/one-collapsible-list-header';

export default OneCollapsibleListItemHeader.extend({
  layout,
  tagName: 'li',
  classNames: ['one-collapsible-list-header'],
  classNameBindings: ['_isListCollapsed:collapsed:opened', 'withPlaceForDots'],

  /**
   * To inject.
   * Title for list.
   * @type {string}
   */
  title: '',

  /**
   * If true, list is collapsed
   * @type {boolean}
   */
  _isListCollapsed: false,

  /**
   * Action, that collapses list
   * @type {Function}
   */
  toggle: null,

  /**
   * Action, that passes search query to list
   * @type {Function}
   */
  search: null,

  /**
   * If false, search input will be hidden
   * @type {boolean}
   */
  searchVisible: true,

  /**
   * If true, header includes "dots menu" and `with-place-for-dots` class is added
   * @type {boolean}
   */
  withPlaceForDots: false,

  init() {
    this._super(...arguments);

    this.set('_clickDisabledElementsSelector',
      this.get('_clickDisabledElementsSelector') +
      ', .search-group *, .list-header-content *');
  },
});
