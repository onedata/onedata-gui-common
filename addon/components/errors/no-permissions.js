/**
 * Shows error, that user has unsufficient permissions to access some resource.
 *
 * @module components/errors/no-permissions
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import layout from 'onedata-gui-common/templates/components/errors/no-permissions';

export default Component.extend(I18n, {
  layout,
  classNames: ['no-permissions'],
});
