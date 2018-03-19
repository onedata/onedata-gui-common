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
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from '../templates/components/actions-popover-content';

export default Component.extend({
  layout,
  tagName: 'ul',
  classNames: ['actions-popover-content', 'dropdown-menu'],

  /**
   * @type {Array<Action>>}
   */
  actionsArray: Object.freeze([]),

  /**
   * @type {function}
   * @return {undefined}
   */
  actionClicked: () => {},

  actions: {
    triggerAction(action) {
      action();
      this.get('actionClicked')();
    }
  }
});
