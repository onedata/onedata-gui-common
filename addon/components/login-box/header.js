/**
 * A login-box header component
 *
 * @module components/login-box/header
 * @author Michal Borzecki, Jakub Liput
 * @copyright (C) 2017-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject } from '@ember/service';
import layout from '../../templates/components/login-box/header';

export default Component.extend({
  layout,

  i18n: inject(),

  /**
   * Class added to login-main-title element
   * Can be used to display some secondary image
   * @type {string}
   */
  loginMainTitleClass: '',

  /**
   * Main title of login view
   * Typically, should be overriden in subclasses
   * Alternatively, locale: `components.loginBox.header.brandTitle` can be set
   * @type {string}
   */
  brandTitle: computed(function () {
    return this.get('i18n').t('components.loginBox.header.brandTitle');
  }),

  /**
   * Subtitle of login view
   * Typically, should be overriden in subclasses
   * Alternatively, locale: `components.loginBox.header.brandSubtitle` can be set
   * @type {string}
   */
  brandSubtitle: computed(function () {
    return this.get('i18n').t('components.loginBox.header.brandSubtitle');
  }),
});
