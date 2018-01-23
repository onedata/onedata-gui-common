/**
 * A base to build a component that shows info about space in context of particular provider.
 * 
 * @module mixins/components/provider-space
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Mixin from '@ember/object/mixin';

import { alias } from '@ember/object/computed';
import { get, computed } from '@ember/object';

export default Mixin.create({
  /**
   * Provider ID
   * To inject.
   * @type {String}
   * @required
   */
  providerId: null,

  /**
   * Space
   * To inject.
   * @type {Onezone.SpaceDetails}
   * @required
   */
  space: null,

  /**
   * Space name
   * @type {computed.string}
   */
  _name: alias('space.name'),

  /**
   * Space icon name
   * @type {computed.string}
   */
  _iconName: computed('space.isDefault', function () {
    return this.get('space.isDefault') ? 'space-default' : 'space';
  }),

  /**
   * Space support size
   * @type {computed.number}
   */
  _supportSize: computed('space.supportSizes', 'providerId', function () {
    let {
      space,
      providerId,
    } = this.getProperties('space', 'providerId');
    let supportSizes = get(space, 'supportSizes');

    if (supportSizes && providerId) {
      return supportSizes[providerId];
    } else {
      return null;
    }
  }),
});
