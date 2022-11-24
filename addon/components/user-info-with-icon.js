/**
 * Renders user info with icon
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from '../templates/components/user-info-with-icon';

export default Component.extend({
  layout,
  tagName: 'span',
  classNames: ['user-info-with-icon'],

  /**
   * @virtual
   * @type {Models.User}
   */
  user: undefined,

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
