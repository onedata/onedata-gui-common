/**
 * A tile, container for small summary of some aspect used mainly in overviews
 * 
 * Put them in `.one-tile-container` div.
 * Set `aspect` property for use as a link.
 *
 * @module components/one-tile
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2018-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from '../templates/components/one-tile';

import { inject as service } from '@ember/service';
import { computed, observer } from '@ember/object';
import { debounce, next } from '@ember/runloop';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import $ from 'jquery';
import computedT from 'onedata-gui-common/utils/computed-t';

export default Component.extend(I18n, {
  layout,
  classNames: ['one-tile'],
  classNameBindings: [
    'isLink:one-tile-link',
    'sizeClass',
  ],

  i18n: service(),
  router: service(),

  /**
   * @override
   */
  touchActionProperties: '',

  /**
   * @override
   */
  i18nPrefix: 'components.oneTile',

  /**
   * @virtual optional
   * If provided, it will be the `href` of "more" link in tile
   * @type {string}
   */
  customLink: undefined,

  /**
   * If set, the tile will be a link to some aspect of currently loaded resource
   * @type {string}
   */
  aspect: undefined,

  /**
   * Route specification used to generate a link related to this tile. It has
   * a higher priority than `aspect` property.
   * @type {Array<string>}
   */
  route: undefined,

  /**
   * Query params for route specified in `route`
   * @type {Object|undefined}
   */
  routeQueryParams: undefined,

  /**
   * If provided, the tile will have separate footer section with text or link.
   * Use `footerLinkToParams` to set the link.
   * @type {string}
   */
  footerText: undefined,

  /**
   * If `footerText` is provided, this is an icon to display on the left
   * of the text.
   * @type {string}
   */
  footerTextIcon: undefined,

  /**
   * Array of parameters for footer `link-to` helper.
   * @type {Array<string|object>}
   */
  footerLinkToParams: Object.freeze([]),

  /**
   * @virtual optional
   * @type {string}
   */
  footerClass: undefined,

  /**
   * @virtual optional
   * @type {string}
   */
  tooltipText: undefined,

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
  _isLink: computed('isLink', 'aspect', 'route', 'customLink', function _isLink() {
    const {
      isLink,
      aspect,
      route,
      customLink,
    } = this.getProperties('isLink', 'aspect', 'route', 'customLink');
    return isLink && (aspect || route || customLink);
  }),

  /**
   * Prepared link-to helper arguments
   * @type {Ember.ComputedProperty<Array<any>>}
   */
  linkToParams: computed(
    'route',
    'routeQueryParams',
    'aspect',
    function linkToParams() {
      const {
        route,
        routeQueryParams,
        aspect,
      } = this.getProperties('route', 'routeQueryParams', 'aspect');
      // emulate `query-params` helper result
      const queryParamsObject = routeQueryParams ? {
        isQueryParams: true,
        values: routeQueryParams,
      } : undefined;

      if (!route && !aspect) {
        return null;
      }

      const routeElements = route ? route : ['onedata.sidebar.content.aspect',
        aspect,
      ];
      return queryParamsObject ?
        routeElements.concat(queryParamsObject) : routeElements;
    }
  ),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  moreText: computedT('more'),

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

  tileMainClick(clickEvent) {
    // do not redirect if "more" has been clicked (it's an anchor itself)
    // do not open if clicked with right button
    if ($(clickEvent.target).closest('.more-link').length || clickEvent.button === 2) {
      return;
    }
    const customLink = this.get('customLink');
    if (customLink) {
      const newWindowClick = clickEvent.button === 1 ||
        clickEvent.ctrlKey || clickEvent.shiftKey || clickEvent.metaKey;
      const target = newWindowClick ? '_blank' : '_self';
      this.get('_window').open(customLink, target);
    } else {
      const {
        router,
        aspect,
        route,
        routeQueryParams,
      } = this.getProperties('router', 'aspect', 'route', 'routeQueryParams');
      // do not redirect if there is no route nor aspect
      if (!route && !aspect) {
        return;
      }
      const transitionToArgs = route ?
        route : ['onedata.sidebar.content.aspect', aspect];
      if (routeQueryParams) {
        transitionToArgs.push({ queryParams: routeQueryParams });
      }
      router.transitionTo(...transitionToArgs);
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
        _window,
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
        next(() => _window.dispatchEvent(new Event('resize')));
      }
    }
  },

  actions: {
    tileMainClick(clickEvent) {
      return this.tileMainClick(clickEvent);
    },
  },
});
