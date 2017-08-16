/**
 * Item header class of the collapsible list. For example of use case see 
 * components/one-collapsible-list.js.
 * 
 * If toolbarWhenOpened == true then .btn-toolbar elements will be 
 * visible only if the list item is expanded.
 * isCollapsible == false disables collapse functionality.
 * 
 * Yields:
 * - toggleAction - action, that toggles list item visibility
 *
 * @module components/one-collapsible-list-item-header.js
 * @author Michał Borzęcki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';
import layout from 'onedata-gui-common/templates/components/one-collapsible-list-item-header';
import { invoke, invokeAction } from 'ember-invoke-action';

const {
  observer,
} = Ember;

export default Ember.Component.extend({
  layout,
  tagName: 'div',
  classNames: ['one-collapsible-list-item-header', 'row', 'list-header-row', 'truncate'],
  classNameBindings: [
    'isOpened:opened',
    'isCollapsible:collapsible',
    'toolbarWhenOpened:toolbar-when-opened',
    'disableToggleIcon:disable-toggle-icon',
    '_isItemFixed:header-fixed'
  ],

  /**
   * If true, do not render toggle icon even if header if isCollapsible
   * @type {boolean}
   */
  disableToggleIcon: false,

  /**
   * If true, item can be collapsed
   * @type {boolean}
   */
  isCollapsible: true,

  /**
   * A selector for elements, which click actions should be ignored by item 
   * toggle event handler
   * @type {string}
   */
  _clickDisabledElementsSelector: 
    '.btn-toolbar *, .webui-popover *, .item-checkbox, .item-checkbox *',
  
  _clickHandlerObserver: observer('_isItemFixed', 'isCollapsible', function () {
    let {
      _isItemFixed,
      isCollapsible,
      _clickDisabledElementsSelector: selector
    } = this.getProperties(
      '_isItemFixed',
      'isCollapsible',
      '_clickDisabledElementsSelector'
    );
    if (!_isItemFixed && isCollapsible) {
      this.set('click', (event) => {
        if ((event.target.matches && event.target.matches(selector)) ||
          (event.target.msMatchesSelector && event.target.msMatchesSelector(selector))) {
          event.stopPropagation();
        } else {
          invoke(this, 'toggle');
        }
      });
    } else {
      this.set('click', undefined);
    }
  }),
  
  init() {
    this._super(...arguments);
    this._clickHandlerObserver();
  },

  actions: {
    /**
     * Toggles collapse state of the collapsible item
     * @param {boolean} opened should item be opened or collapsed?
     */
    toggle(opened) {
      if (!this.get('_isItemFixed') && this.get('isCollapsible')) {
        invokeAction(this, 'toggle', opened);
      }
    }
  }
});
