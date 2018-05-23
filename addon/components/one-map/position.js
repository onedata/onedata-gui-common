/**
 * A one-map position component. Represents a place in a map, which 
 * should be specified using latitude and longitude properties.
 * 
 * @module components/one-map/position
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import layout from 'onedata-gui-common/templates/components/one-map/position';
import { htmlSafe } from '@ember/string';

export default Component.extend({
  layout,
  tagName: '',

  /**
   * @type {number}
   * @virtual
   */
  latitude: 0,

  /**
   * @type {number}
   * @virtual
   */
  longitude: 0,

  /**
   * If true, position will be rendered as absolutely positioned div,
   * otherwise it will be tagless.
   * @type {boolean}
   */
  useContainerElement: true,

  /**
   * @type {Object}
   * @virtual
   */
  mapInstance: undefined,

  /**
   * Last map view change event (used to detect map changes)
   * @type {Object}
   * @virtual
   */
  lastViewportChangeEvent: undefined,

  /**
   * Point position on map in px represented using object {x, y}
   * @type {Ember.ComputedProperty<Object>}
   */
  _position: computed(
    'mapInstance',
    'lastViewportChangeEvent',
    'longitude',
    'latitude',
    function () {
      const {
        mapInstance,
        longitude,
        latitude,
      } = this.getProperties('mapInstance', 'longitude', 'latitude');
      return mapInstance ? mapInstance.latLngToPoint(latitude, longitude) : undefined;
    }
  ),

  /**
   * Point y position on map (in px)
   * @type {Ember.ComputedProperty<number>}
   */
  x: reads('_position.x'),

  /**
   * Point y position on map (in px)
   * @type {Ember.ComputedProperty<number>}
   */
  y: reads('_position.y'),

  /**
   * @type {Handlebars.SafeString}
   */
  _positionContainerStyle: computed('_position', function () {
    const _position = this.get('_position');
    const isVisible = _position && _position.x >= 0 && _position.y >= 0;
    return htmlSafe(isVisible ?
      `left: ${_position.x}px; top: ${_position.y}px;` :
      'display: none;'
    );
  }),
});
