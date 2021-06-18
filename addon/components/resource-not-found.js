/**
 * Component that show info "Resource not found".
 *
 * @module components/resource-not-found
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from '../templates/components/resource-not-found';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  layout,
  classNames: ['resource-not-found'],

  /**
   * @override
   */
  i18nPrefix: 'components.resourceNotFound',
});
