/**
 * An item element for one-collapsible-toolbar. For example of use see
 * description for one-collapsible-toolbar component.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2017-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';

import { computed } from '@ember/object';
import layout from 'onedata-gui-common/templates/components/one-collapsible-toolbar-item';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';

export default Component.extend({
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
  itemAction: notImplementedIgnore,

  /**
   * Action invoked to close dropdown.
   * To inject.
   * @type {function}
   */
  closeDropdown: notImplementedIgnore,

  buttonSizeClass: computed('buttonSize', function () {
    const buttonSize = this.get('buttonSize');
    if (buttonSize.length > 0) {
      return 'btn-' + buttonSize;
    } else {
      return '';
    }
  }),

  actions: {
    runAction(inFullMode) {
      const {
        isDisabled,
        closeOnAction,
        closeDropdown,
        itemAction,
      } = this.getProperties(
        'isDisabled',
        'closeOnAction',
        'closeDropdown',
        'itemAction',
      );
      if (!isDisabled) {
        if (closeOnAction) {
          closeDropdown();
        }
        itemAction(inFullMode);
      }
    },
  },
});
