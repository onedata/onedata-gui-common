/**
 * An item element for one-collapsible-toolbar. For example of use see
 * description for one-collapsible-toolbar component.
 *
 * @module components/one-collapsible-toolbar-item
 * @author Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';
import layout from 'onedata-gui-common/templates/components/one-collapsible-toolbar-item';
import { invokeAction } from 'ember-invoke-action';

const {
  computed,
} = Ember;


export default Ember.Component.extend({
  layout,
  classNames: ['one-collapsible-toolbar-item'],
  classNameBindings: ['isMinimized:minimized:full', 'isDisabled:disabled'],

  /**
   * State of parent collapsible-toolbar
   * @type {boolean}
   */
  isMinimized: false,

  /**
   * Button style (from bootstrap). Available values: 
   * default, primary, success, info, warning, danger, link
   * @type {string}
   */
  buttonStyle: 'default',

  /**
   * Button component type. Available values:
   * bs - bs-button
   * @type {string}
   */
  buttonType: 'bs',

  /**
   * Button size (from bootstrap). Available values:
   * xs, sm, lg, empty string means standard size 
   * @type {string}
   */
  buttonSize: 'sm',

  /**
   * CSS classes for item trigger. In full mode it is button, 
   * in minimized it is dropdown menu item.
   * @type {string}
   */
  triggerClasses: '',

  /**
   * Is trigger disabled?
   * @type {boolean}
   */
  isDisabled: false,

  /**
   * Should dropdown be closed after trigger click?
   * @type {boolean}
   */
  closeOnAction: true,

  /**
   * Action invoked after trigger click.
   * @type {function}
   */
  itemAction: null,

  /**
   * Action invoked to close dropdown.
   * To inject.
   * @type {function}
   */
  closeDropdown: null,

  buttonSizeClass: computed('buttonSize', function () {
    let buttonSize = this.get('buttonSize');
    if (buttonSize.length > 0) {
      return 'btn-' + buttonSize;
    }
    else {
      return '';
    }
  }),

  actions: {
    runAction(inFullMode) {
      if (this.get('closeOnAction')) {
        invokeAction(this, 'closeDropdown');
      }
      invokeAction(this, 'itemAction', inFullMode);
    }
  },
});
