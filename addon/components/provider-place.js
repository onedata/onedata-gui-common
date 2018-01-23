/**
 * A circle representing a provider on world map.
 * 
 * @module components/provider-place
 * @author Jakub Liput, Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';

import { get, observer, computed } from '@ember/object';
import layout from 'onedata-gui-common/templates/components/provider-place';

export default Component.extend({
  layout,
  classNames: ['provider-place'],
  classNameBindings: ['status'],

  /**
   * A provider model that will be represented on map
   * To inject.
   * @type {Onezone.ProviderDetails}
   */
  provider: null,

  /**
   * Parent atlas component width
   * @type {number}
   */
  atlasWidth: 0,

  /**
   * Scale factor for circle size
   * @type {number} 
   */
  circleSizeScale: 1,

  /**
   * If true, drop is rendered after circle click
   * @type {boolean}
   */
  renderDrop: true,

  /**
   * Provider status
   * @type {computed.string}
   */
  status: computed('provider.status', function () {
    let provider = this.get('provider');
    return get(provider, 'isStatusValid') ? get(provider, 'status') : 'pending';
  }),

  atlasWidthObserver: observer('atlasWidth', function () {
    this._recalculateSize();
  }),

  didInsertElement() {
    this._super(...arguments);
    this._recalculateSize();
  },

  /**
   * Adjusts circle size to atlas width
   */
  _recalculateSize() {
    let {
      atlasWidth,
      circleSizeScale,
    } = this.getProperties('atlasWidth', 'circleSizeScale');
    let width = atlasWidth * 0.02 * circleSizeScale;

    this.$().find('.circle').css({
      fontSize: width * 0.75 + 'px',
      width: width + 'px',
      height: width + 'px',
    });
  },
});
