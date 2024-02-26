/**
 * Abstract component for creating list of second level items in sidebar (called
 * aspects).
 *
 * @author Jakub Liput
 * @copyright (C) 2019-2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { reads } from '@ember/object/computed';
import layout from '../../templates/components/one-sidebar/second-level-items';

/**
 * @typedef {Object} OneSidebarSecondLevelItem
 * @property {string} id
 * @property {string|SafeString} label
 * @property {string} icon
 * @property {string} [itemClassId] If provided, the `li` element will have a
 *   `item-{itemClassId}` class instead of `item-{id}`. This optional property has been
 *   introduced to avoid names coupled with aspect name, which should not be used in
 *   classname.
 * @property {string|SafeString} [warningMessage]
 * @property {boolean} [forbidden]
 * @property {boolean} [disabled]
 * @property {string|SafeString} [tip]
 */

export default Component.extend({
  layout,
  classNames: ['second-level-items'],

  /**
   * @virtual
   * @type {object} primary sidebar item
   */
  item: undefined,

  /**
   * Current active aspect ID
   * @virtual
   * @type {string}
   */
  secondaryItemId: undefined,

  /**
   * Reference to sidebar component instance
   * @virtual
   */
  sidebar: undefined,

  /**
   * @virtual
   * @type {Array<OneSidebarSecondLevelItem>}
   */
  secondLevelItems: undefined,

  /**
   * Typically ID of sidebar route (eg. `groups`)
   * @virtual
   * @type {string}
   */
  sidebarType: undefined,

  /**
   * @type {Ember.ComputedProperty<Array<Object>>}
   */
  internalSecondLevelItems: reads('secondLevelItems'),
});
