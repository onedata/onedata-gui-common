/**
 * Renders animated icon, which show popover with user info after click, 
 * and username with fullname
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from '../templates/components/user-info-with-icon';
import { reads } from '@ember/object/computed';

export default Component.extend({
  layout,
  tagName: 'span',
  classNames: ['user-info-with-icon'],

  /**
   * @virtual
   * @type {ComputedProperty<PromiseObject<Models.User>>}
   */
  userProxy: undefined,

  /**
   * @type {Models.User}
   */
  user: reads('userProxy.content'),

  /**
   * @type {Boolean}
   */
  hasUserInfoHovered: false,

  actions: {
    userInfoHovered(hasHover) {
      this.set('hasUserInfoHovered', hasHover);
    },
  },
});
