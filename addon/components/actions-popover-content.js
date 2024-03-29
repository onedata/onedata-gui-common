/**
 * A component that renders list of actions in dropdown-friendly form. Usually it
 * will be used inside dropdown popovers.
 *
 * Needs actionsArray to be provided. It is an array of Action objects.
 * Between normal actions, special separator action can be provided (Action
 * object with field `separator: true`) - it will be rendered as a header
 * for all following actions.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2018-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from '../templates/components/actions-popover-content';
import { get, computed } from '@ember/object';
import { scheduleOnce } from '@ember/runloop';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import config from 'ember-get-config';

export default Component.extend(I18n, {
  layout,
  tagName: 'ul',
  classNames: ['actions-popover-content', 'dropdown-menu'],

  /**
   * @override
   */
  i18nPrefix: 'components.actionsPopoverContent',

  /**
   * Name of property with unique value of actions in `actionsArray` to use in `each`
   * template helper to prevent unnecessary re-rendering.
   * @virtual optional
   * @type {string|undefined}
   */
  actionKey: undefined,

  /**
   * @type {Array<Utils.Action|Action>>}
   */
  actionsArray: Object.freeze([]),

  /**
   * @type {*}
   */
  actionsArg: undefined,

  /**
   * @type {function}
   * @returns {undefined}
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
   * If true, enables hide transition for nested actions.
   * @type {boolean}
   */
  withoutNestedActionsTransition: config.environment === 'test',

  /**
   * True, if there are no functional actions in `actionsArray` (eg. only separators)
   * @type {ComputedProperty<Boolean>}
   */
  noRealActions: computed('actionsArray.[]', function noRealActions() {
    const actionsArray = this.get('actionsArray');
    return !actionsArray || !get(actionsArray.rejectBy('separator'), 'length');
  }),

  toggleNestedActions(item, isOpened) {
    const normalizedItem = item === null ? this.nestedActionsOpened : item;
    if (isOpened && this.nestedActionsOpened !== normalizedItem) {
      this.set('nestedActionsOpened', normalizedItem);
    } else if (!isOpened && this.nestedActionsOpened === normalizedItem) {
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
