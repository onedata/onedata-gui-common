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
import { computed } from '@ember/object';
import layout from '../templates/components/one-map';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import $ from 'jquery';
import _ from 'lodash';

export default Component.extend({
  layout,

  classNames: ['one-map'],

  /**
   * Name of the event, that will be dispatched on window on each map change
   * @type {string}
   */
  triggerWindowEventName: 'mapResize',

  /**
   * @type {Function}
   * @param {object} event
   */
  onViewportChange: () => {},

  /**
   * Initial state, that will be applied to the first map render
   * @type {object}
   */
  initialState: Object.freeze({}),

  /**
   * @type {JQuery}
   */
  $mapContainer: undefined,

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

  /**
   * Do not modify. Persists state of the component.
   * @type {number}
   */
  _containerWidth: 0,

  /**
   * Do not modify. Persists state of the component.
   * @type {number}
   */
  _containerHeight: 0,

  /**
   * @type {Ember.ComputedProperty<object>}
   */
  _initialState: computed('initialState', function () {
    const defaultState = {
      lat: 0,
      lng: 0,
      scale: 1,
      x: 0,
      y: 0,
    };
    const resultState = _.assign(defaultState, this.get('initialState'));
    // 0.0001 value is a fix for jvectormap. Library checks if lat and lng
    // values are truthy. Of course 0 values are falsy and they breaks down
    // map focus. So zeros are converted to zero-like truthy values (0.0001).
    resultState.lat = Math.min(90, Math.max(-90, resultState.lat) || 0.0001);
    resultState.lng = Math.min(180, Math.max(-180, resultState.lng) || 0.0001);
    resultState.scale = Math.min(8, Math.max(1, resultState.scale) || 1);
    return resultState;
  }),

  didInsertElement() {
    this._super(...arguments);

    const _initialState = this.get('_initialState');
    const $mapContainer = this.$('.one-map-container');
    this.set('$mapContainer', $mapContainer);
    this.set('_mapInstance',
      $mapContainer.vectorMap({
        map: 'world_mill',
        backgroundColor: 'transparent',
        focusOn: _initialState,
        onViewportChange: (event, scale) =>
          safeExec(this, '_handleViewportChange', event, scale),
      }).vectorMap('get', 'mapObject')
    );
  },

  willDestroyElement() {
    try {
      $('.jvectormap-tip').remove();
      // jvectormap fix: removes unused resize handler
      const _mapInstance = this.get('_mapInstance');
      $(window).unbind('resize', _mapInstance.onResize);
    } finally {
      this._super(...arguments);
    }
  },

  /**
   * Handles map viewport change event.
   * @param {JQuery.Event} event 
   * @param {number} scale 
   */
  _handleViewportChange(event, scale) {
    const {
      triggerWindowEventName,
      $mapContainer,
      onViewportChange,
    } = this.getProperties(
      'triggerWindowEventName',
      '$mapContainer',
      'onViewportChange'
    );
    const _mapInstance = $mapContainer.vectorMap('get', 'mapObject');
    const {
      lat,
      lng,
    } = _mapInstance.pointToLatLng(
      _mapInstance.width / 2,
      _mapInstance.height / 2
    );
    const calculatedEvent = {
      event,
      scale,
      lat,
      lng,
    };
    this.setProperties({
      _lastViewportChangeEvent: calculatedEvent,
      _containerHeight: _mapInstance.height,
      _containerWidth: _mapInstance.width,
    });
    if (triggerWindowEventName) {
      window.dispatchEvent(new Event(triggerWindowEventName));
    }
    onViewportChange(calculatedEvent);
  }
});
