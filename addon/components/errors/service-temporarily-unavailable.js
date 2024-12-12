/**
 * Error screen for "service temporarily unavailable".
 *
 * @author Jakub Liput
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { layout } from '@ember-decorators/component';
import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/i18n';
import template from 'onedata-gui-common/templates/components/one-sidebar';

@layout(template)
export default class ServiceTemporarilyUnavailable extends Component.extend(I18n) {
  /** @override */
  i18nPrefix = 'components.errors.serviceTemporarilyUnavailable';
}
