/**
 * A world map component, on which other components can be placed according 
 * to specified latitude and longitude. Yields hash with "position" component
 * that allows to use x and y computed from given lat./long.
 * Example:
 * ```
 * {{#one-map as |map|}}
 *   {{#map.position latitude=50.7 longitude=20 as |x y|}}
 *     Cracow
 *   {{/map.position}}
 * {{/one-atlas}}
 * ```
 * 
 * @module components/one-map
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from '../templates/components/one-map';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';

export default Component.extend({
  layout,

  classNames: ['one-map'],

  /**
   * @type {JVectorMap.Map}
   */
  _mapInstance: undefined,

  /**
   * Last map view change event (used to detect map changes).
   * It is an object {event, scale}
   * @type {Object}
   */
  _lastViewportChangeEvent: undefined,

  didInsertElement() {
    this._super(...arguments);

    const $mapContainer = this.$('.one-map-container');
    this.setProperties({
      _mapInstance: $mapContainer.vectorMap({
        map: 'world_mill',
        backgroundColor: 'transparent',
        onViewportChange: (event, scale) => safeExec(this, () =>
          this.set('_lastViewportChangeEvent', { event, scale })
        ),
      }).vectorMap('get', 'mapObject'),
    });
  },
});
