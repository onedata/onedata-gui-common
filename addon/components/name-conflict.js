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
import { getBy } from 'ember-awesome-macros';
import layout from 'onedata-gui-common/templates/components/name-conflict';

export const defaultSeparator = '@';

export default Component.extend({
  layout,
  tagName: '',
  separator: defaultSeparator,

  /**
   * To show conflict label, it should contain property pointed by `conflictLabelProperty`
   * option (usually `'conflictLabel'`).
   * @type {{ name: string }}
   */
  item: undefined,

  /**
   * @virtual optional
   * @type {string}
   */
  conflictLabelProperty: 'conflictLabel',

  /**
   * @type {ComputedProperty<string | undefined>}
   */
  conflictLabel: getBy('item', 'conflictLabelProperty'),
});
