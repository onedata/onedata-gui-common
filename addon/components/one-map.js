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
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';

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
   * @param {object} event Object with fields { event, scale, lat, lng }
   *  event field is the source event triggered by map. Scale, lat and lng are
   *  the actual state of the map.
   */
  onViewportChange: notImplementedIgnore,

  /**
   * Initial state, that will be applied to the first map render
   * @type {object}
   */
  initialState: Object.freeze({}),

  zoomOnScroll: true,

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

  /**
   * Window object for test purposes
   * @type {Window}
   */
  _window: window,

  didInsertElement() {
    this._super(...arguments);

    const {
      _initialState,
      zoomOnScroll,
    } = this.getProperties('_initialState', 'zoomOnScroll');
    const $mapContainer = this.$('.one-map-container');
    this.set('$mapContainer', $mapContainer);
    this.set('_mapInstance',
      $mapContainer.vectorMap({
        map: 'world_mill',
        backgroundColor: 'transparent',
        focusOn: _initialState,
        zoomOnScroll,
        onViewportChange: (event, scale) =>
          safeExec(this, '_handleViewportChange', event, scale),
      }).vectorMap('get', 'mapObject')
    );

    this._delayViewportChangeTransform();

    // Redirect wheel event from non-map elements to the map container to
    // handle zoom-in/out
    const scrollRedirectHandler = (event) => {
      const target = $(event.target);
      const properTargetSelector = '.jvectormap-container';
      if (!target.closest(properTargetSelector).length) {
        const origEvent = event.originalEvent;
        const newEvent = new origEvent.constructor(origEvent.type, origEvent);
        $mapContainer.find(properTargetSelector)[0].dispatchEvent(newEvent);
        return false;
      }
    };
    this.$().on('wheel', scrollRedirectHandler);
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
   * Moves map transform processing to the next runloop frame
   * @returns {undefined}
   */
  _delayViewportChangeTransform() {
    /** @type {jvm.SVGCanvasElement} */
    const canvas = this.get('_mapInstance.canvas');
    const oldApplyTransformParams = canvas.applyTransformParams.bind(canvas);
    const newApplyTransformParams = (...args) => {
      setTimeout(() => oldApplyTransformParams(...args), 0);
    }
    canvas.applyTransformParams = newApplyTransformParams;
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
      _window,
    } = this.getProperties(
      'triggerWindowEventName',
      '$mapContainer',
      'onViewportChange',
      '_window'
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
      _window.dispatchEvent(new Event(triggerWindowEventName));
    }
    onViewportChange(calculatedEvent);
  }
});
