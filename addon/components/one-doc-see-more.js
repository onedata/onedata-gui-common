/**
 * General text with link to documentation with customizable documentation path and text
 * 
 * @module components/one-doc-see-more
 * @author Jakub Liput
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from '../templates/components/one-doc-see-more';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';

export default Component.extend(I18n, {
  layout,
  tagName: 'span',
  classNames: ['one-doc-see-more'],

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.oneDocSeeMore',

  /**
   * @virtual
   * @type {String}
   * An argument for one-doc-url helper, see `one-doc-url` for details
   */
  docPath: '',

  /**
   * @virtual optional
   * @type {String}
   * Text of link displayed for user. Can be empty to display generic link name.
   */
  linkName: '',
});
