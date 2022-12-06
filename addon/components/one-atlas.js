/**
 * A world map component, on which other components can be placed according
 * to specified latitude and longitude. Yields hash with "position" component
 * that allows to use x and y computed from given lat./long.
 * Example:
 * ```
 * {{#one-atlas as |atlas|}}
 *   {{#atlas.position latitude=35 longitude=139 as |position|}}
 *     {{#position.point}}
 *       Tokyo
 *     {{/position.point}}
 *   {{/atlas.position}}
 *   {{#atlas.position latitude=50.7 longitude=20 as |position|}}
 *     {{#position.point}}
 *       Cracow
 *     {{/position.point}}
 *   {{/atlas.position}}
 *   {{#atlas.position latitude=40.7 longitude=-74 as |position|}}
 *     {{#position.point}}
 *       New York
 *     {{/position.point}}
 *   {{/atlas.position}}
 * {{/one-atlas}}
 * ```
 *
 * @module components/one-atlas
 * @author Jakub Liput, Michal Borzecki
 * @copyright (C) 2017-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import layout from 'onedata-gui-common/templates/components/one-atlas';
import dom from 'onedata-gui-common/utils/dom';

// Atlas image aspect ratio - needed when recomputing new atlas size
const ATLAS_AR = 1.361111111112;

export default Component.extend({
  layout,
  classNames: ['one-atlas'],

  /**
   * Component width
   * @type {number}
   */
  width: 0,

  /**
   * Component height
   * @type {number}
   */
  height: 0,

  /**
   * Component width/height ratio
   * @type {number}
   */
  _sizeRatio: ATLAS_AR,

  /**
   * Window property for testing purposes
   * @type {Window}
   */
  _window: window,

  /**
   * Window resize event handler
   */
  _resizeEventHandler: computed(function () {
    return () => this.resizeToFit();
  }),

  didInsertElement() {
    this._super(...arguments);

    const {
      _resizeEventHandler,
      _window,
    } = this.getProperties('_resizeEventHandler', '_window');

    this.resizeToFit();
    _window.addEventListener('resize', _resizeEventHandler);
  },

  willDestroyElement() {
    try {
      const {
        _resizeEventHandler,
        _window,
      } = this.getProperties('_resizeEventHandler', '_window');
      _window.removeEventListener('resize', _resizeEventHandler);
    } finally {
      this._super(...arguments);
    }
  },

  resizeToFit() {
    const parentBoundingRect = this.element.parentElement.getBoundingClientRect();
    const parentWidth = parentBoundingRect.width;
    const parentHeight = parentBoundingRect.height;
    let newWidth = parentWidth;
    let newHeight = newWidth * (1 / this._sizeRatio);

    if (newHeight > parentHeight) {
      newHeight = parentHeight;
      newWidth = newHeight * this._sizeRatio;
    }

    this.setProperties({
      width: newWidth,
      height: newHeight,
    });
    dom.setStyles(this.element, {
      width: `${newWidth}px`,
      height: `${newHeight}px`,
      backgroundSize: `${newWidth}px ${newHeight}px`,
    });
  },
});
