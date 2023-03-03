/**
 * Abstract component for creating list of second level items in sidebar (called
 * aspects).
 *
 * @author Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { reads } from '@ember/object/computed';
import layout from '../../templates/components/one-sidebar/second-level-items';

export default Component.extend({
  layout,
  classNames: ['second-level-items'],

  /**
   * @virtual
   * @type {object} primary sidebar item
   */
  item: undefined,

  /**
   * @virtual
   * Current active aspect ID
   * @type {string}
   */
  secondaryItemId: undefined,

  /**
   * @virtual
   * Reference to sidebar component instance
   */
  sidebar: undefined,

  /**
   * @virtual
   * @type {Array<object>} each:
   * ```
   * { id, label, icon, [warningMessage], [forbidden], [disabled], [tip] }`
   * ```
   */
  secondLevelItems: undefined,

  /**
   * @virtual
   * Typically ID of sidebar route (eg. `groups`)
   * @type {string}
   */
  sidebarType: undefined,

  /**
   * @type {Ember.ComputedProperty<Array<Object>>}
   */
  internalSecondLevelItems: reads('secondLevelItems'),
});
