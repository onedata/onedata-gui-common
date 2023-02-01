/**
 * Display a name of some record with optional conflictLabel if available
 *
 * Used e.g. in spaces list to distinguish spaces with the same name
 *
 * @author Jakub Liput
 * @copyright (C) 2017-2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from 'onedata-gui-common/templates/components/name-conflict';

export const defaultSeparator = '@';

export default Component.extend({
  layout,
  tagName: '',
  separator: defaultSeparator,
});
