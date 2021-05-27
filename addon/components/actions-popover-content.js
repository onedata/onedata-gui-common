/**
 * A component that renders list of actions in dropdown-friendly form. Usually it
 * will be used inside dropdown popovers.
 * 
 * Needs actionsArray to be provided. It is an array of Action objects.
 * Between normal actions, special separator action can be provided (Action 
 * object with field `separator: true`) - it will be rendered as a header 
 * for all following actions.
 *
 * @module components/actions-popover-content
 * @author Michal Borzecki
 * @copyright (C) 2018-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from '../templates/components/actions-popover-content';
import { get, computed } from '@ember/object';
import { scheduleOnce } from '@ember/runloop';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  layout,
  tagName: 'ul',
  classNames: ['actions-popover-content', 'dropdown-menu'],

  /**
   * @override
   */
  i18nPrefix: 'components.actionsPopoverContent',

  /**
   * @type {Array<Action>>}
   */
  actionsArray: Object.freeze([]),

  /**
   * @type {*}
   */
  actionsArg: undefined,

  /**
   * @type {function}
   * @return {undefined}
   */
  actionClicked: () => {},

  /**
   * If true, nested actions will be rendered in popover instead of nested list
   * @type {boolean}
   */
  nestedActionsInPopover: false,

  /**
   * @type {Action|null}
   */
  nestedActionsOpened: null,

  /**
   * True, if there are no functional actions in `actionsArray` (eg. only separators)
   * @type {ComputedProperty<Boolean>}
   */
  noRealActions: computed('actionsArray.@each.separator', function noRealActions() {
    const actionsArray = this.get('actionsArray');
    return !actionsArray || !get(actionsArray.rejectBy('separator'), 'length');
  }),

  toggleNestedActions(item, isOpened) {
    if (item === null) {
      item = this.get('nestedActionsOpened');
    }
    const nestedActionsOpened = this.get('nestedActionsOpened');
    if (isOpened && nestedActionsOpened !== item) {
      this.set('nestedActionsOpened', item);
    } else if (!isOpened && nestedActionsOpened === item) {
      this.set('nestedActionsOpened', null);
    }
  },

  actions: {
    triggerAction(item) {
      if (!get(item, 'disabled')) {
        get(item, 'action')(this.get('actionsArg'));
        this.get('actionClicked')();
      }
    },
    toggleNestedActions(item, isOpened) {
      scheduleOnce('afterRender', this, 'toggleNestedActions', item, isOpened);
    },
  },
});
