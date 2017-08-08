import Ember from 'ember';
import layout from 'onedata-gui-common/templates/components/one-collapsible-list-item-header';
import { invokeAction } from 'ember-invoke-action';

/**
 * Item header class of the collapsible list. For example of use case see 
 * components/one-collapsible-list.js.
 * 
 * If toolbarWhenOpened == true then .btn-toolbar elements will be 
 * visible only if the list item is expanded.
 * isCollapsible == false hides the arrow icon on the right.
 * 
 * Yields:
 * - toggleAction - action, that toggles list item visibility
 *
 * @module components/one-collapsible-list-item-header.js
 * @author Michał Borzęcki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */
export default Ember.Component.extend({
  layout,
  tagName: 'div',
  classNames: ['one-collapsible-list-item-header', 'row', 'list-header-row', 'truncate'],
  classNameBindings: ['isOpened:opened', 'isCollapsible:collapsible',
    'toolbarWhenOpened:toolbar-when-opened', 'disableToggleIcon:disable-toggle-icon',
  ],

  /**
   * If true, do not render toggle icon even if header if isCollapsible
   * @type {boolean}
   */
  disableToggleIcon: false,

  click(event) {
    const selector = '.btn-toolbar *, .webui-popover *';
    if ((event.target.matches && event.target.matches(selector)) ||
      (event.target.msMatchesSelector && event.target.msMatchesSelector(selector))) {
      event.stopPropagation();
    } else {
      invokeAction(this, 'toggle');
    }
  },

  actions: {
    /**
     * Toggles collapse state of the collapsible item
     * @param {boolean} opened should item be opened or collapsed?
     */
    toggle(opened) {
      invokeAction(this, 'toggle', opened);
    }
  }
});
