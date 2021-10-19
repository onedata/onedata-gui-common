/**
 * A component 
 *
 * @module components/public-footer.js
 * @author Agnieszka Warchoł
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';

import I18n from 'onedata-gui-common/mixins/components/i18n';
import layout from 'onedata-gui-common/templates/components/public-footer';

export default Component.extend(I18n, {
  layout,
  classNames: ['public-footer'],

  /**
   * @override
   */
  i18nPrefix: 'components.publicFooter',

});
