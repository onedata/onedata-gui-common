/**
 * A tile, container for small summary of some aspect used mainly in overviews
 * 
 * Put them in `.one-tile-container` div.
 * Set `aspect` property for use as a link.
 *
 * @module components/one-tile
 * @author Jakub Liput, Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from '../templates/components/one-tile';

import { inject as service } from '@ember/service';
import { computed, observer } from '@ember/object';
import { and } from '@ember/object/computed';
import { debounce } from '@ember/runloop';

export default Component.extend({
  layout,
  classNames: ['one-tile'],
  classNameBindings: ['isLink:one-tile-link', 'sizeClass'],

  router: service(),

  /**
   * If set, the tile will be a link to some aspect of currently loaded resource
   * @type {string}
   */
  aspect: undefined,

  /**
   * If true, whole tile is a pseudo-link to aspect.
   * If false, only the "more" anchor will be a link.
   * @type {boolean}
   */
  isLink: true,

  /**
   * If true, tile will automatically upscale according to the x2Breakpoint and
   * x4Breakpoint properties. If some of them are null, then these undefined
   * breakpoints are simply ommitted.
   * @type {boolean}
   */
  isScalable: false,

  /**
   * @type {number|null}
   * @virtual
   */
  x2Breakpoint: 950,

  /**
   * @type {number|null}
   * @virtual
   */
  x4Breakpoint: null,

  /**
   * Tile size class related to x2 and x4 sizes.
   * @type {string}
   */
  sizeClass: '',

  /**
   * Window object (for testing purposes only)
   * @type {Window}
   */
  _window: window,

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  _isLink: and('isLink', 'aspect'),

  /**
   * @type {Ember.ComputedProperty<Function>}
   */
  windowResizeHandler: computed(function windowResizeHandler() {
    return () => debounce(this, this.scaleUp, 50);
  }),

  scaleObserver: observer(
    'isScalable',
    'x2Breakpoint',
    'x4Breakpoint',
    function scaleObserver() {
      this.scaleUp();
    }
  ),

  init() {
    this._super(...arguments);
    if (this.get('_isLink')) {
      this.click = function click() {
        const {
          router,
          aspect,
        } = this.getProperties('router', 'aspect');
        router.transitionTo('onedata.sidebar.content.aspect', aspect);
      }
    }
    this.scaleUp();
  },

  didInsertElement() {
    this._super(...arguments);

    const {
      windowResizeHandler,
      _window,
    } = this.getProperties('windowResizeHandler', '_window');

    _window.addEventListener('resize', windowResizeHandler);
  },

  willDestroyElement() {
    try {
      const {
        windowResizeHandler,
        _window,
      } = this.getProperties('onScroll', 'windowResizeHandler', '_window');

      _window.removeEventListener('resize', windowResizeHandler);
    } finally {
      this._super(...arguments);
    }
  },

  /**
   * Sets tile scale according to breakpoints and window size
   * @returns {undefined}
   */
  scaleUp() {
    if (this.get('isScalable')) {
      const {
        x2Breakpoint,
        x4Breakpoint,
        _window
      } = this.getProperties('x2Breakpoint', 'x4Breakpoint', '_window');
      const windowWidth = _window.innerWidth;
      let sizeClass = '';
      if (x4Breakpoint != null && windowWidth >= x4Breakpoint) {
        sizeClass = 'x4';
      } else if (x2Breakpoint != null && windowWidth >= x2Breakpoint) {
        sizeClass = 'x2';
      }
      if (this.get('sizeClass') !== sizeClass) {
        this.set('sizeClass', sizeClass);
        _window.dispatchEvent(new Event('resize'));
      }
    }
  },
});
