/**
 * Providers sidebar item representing single provider visible for current user
 *
 * @module components/providers-list/provider-item
 * @author Jakub Liput
 * @copyright (C) 2018-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed, get } from '@ember/object';
import { reads } from '@ember/object/computed';
import layout from '../../templates/components/providers-list/provider-item';

import bytesToString from 'onedata-gui-common/utils/bytes-to-string';

export default Component.extend({
  layout,

  /**
   * @virtual
   * @type {models/Provider}
   */
  provider: undefined,

  /**
   * @virtual
   * @type {models/Provider}
   */
  color: undefined,

  /**
   * @virtual
   * @type {models/Space}
   */
  selectedSpace: undefined,

  showSelectedSpaceSupportSize: true,

  showSupportedSpacesCount: true,

  /**
   * @virtual
   * 
   * Array of possible actions per provider. Each action must be in format:
   * ```
   * {
   *   text: 'Action trigger text',
   *   action: someCallback,
   *   class: 'class-for-trigger-element,
   * }
   * ```
   * An actions will be displayed on the right side of the provider
   * item as a popover. Provider object will be passed to the action
   * callback as an argument.
   * @type {Array.Object}
   */
  providerActions: undefined,

  _renderStatus: computed(
    'selectedSpace',
    'provider.spaceList.isFulfilled',
    function _getRenderToolbar() {
      return this.get('selectedSpace') && this.get('provider.spaceList.isFulfilled');
    }),

  _spacesCount: reads('provider.spaceList.content.list.length'),

  _spaceSupportSize: computed(
    'selectedSpace.supportSizes',
    'provider.entityId',
    function getSpaceSupportSize() {
      return bytesToString(get(
        this.get('selectedSpace.supportSizes'),
        this.get('provider.entityId')
      ));
    }),
});
