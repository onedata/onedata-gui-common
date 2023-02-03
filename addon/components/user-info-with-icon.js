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

export default Component.extend({
  layout,
  tagName: 'span',
  classNames: ['user-info-with-icon'],

  /**
   * @virtual
   * @type {UserRecord}
   */
  user: undefined,

  /**
   * @virtual optional
   * @type {Object}
   */
  errorReason: undefined,

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
