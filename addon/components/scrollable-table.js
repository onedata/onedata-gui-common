/**
 * A table component with horizontal and vertical scroll. It automatically adjusts
 * position of row and column labels during scroll and window resize.
 *
 * Every column label cell should have class "column-label". Every row label cell
 * should have class "row-label".
 *
 * Example usage:
 * ```handlebars
 * {{#scrollable-table}}
 *   <tr>
 *     <td class="column-label"></td>
 *     <td class="column-label">column 1</td>
 *     <td class="column-label">column 2</td>
 *     ...
 *   </tr>
 *   <tr>
 *     <td class="row-label">row 1</td>
 *     <td>row 1 column 1 data</td>
 *     <td>row 1 column 2 data</td>
 *     ...
 *   </tr>
 *   <tr>
 *     <td class="row-label">row 2</td>
 *     <td>row 2 column 1 data</td>
 *     <td>row 2 column 2 data</td>
 *     ...
 *   </tr>
 *    ...
 * {{/scrollable-table}}
 * ```
 *
 * @module components/scrollable-table
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from '../templates/components/scrollable-table';
import WindowResizeHandler from 'onedata-gui-common/mixins/components/window-resize-handler';
import { computed, observer } from '@ember/object';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import { inject as service } from '@ember/service';
import { equal, raw } from 'ember-awesome-macros';
import $ from 'jquery';

const initialEdgeScrollState = Object.freeze({
  top: true,
  bottom: true,
  left: true,
  right: true,
});

const initialScrollPosition = Object.freeze({
  top: 0,
  left: 0,
});

const initialSize = Object.freeze({
  width: 0,
  height: 0,
});

export default Component.extend(WindowResizeHandler, {
  layout,
  classNames: ['scrollable-table'],
  classNameBindings: [
    'edgeScrollClasses',
    'renderedInSafari:in-safari',
  ],

  browser: service(),

  /**
   * @virtual optional
   * @type {Function}
   * @returns {any}
   */
  onScroll: notImplementedIgnore,

  /**
   * @virtual optional
   * @type {Boolean}
   */
  disableScroll: false,

  /**
   * @virtual optional
   * @type {Object}
   */
  size: initialSize,

  /**
   * @virtual optional
   * @type {Object}
   */
  edgeScrollState: initialEdgeScrollState,

  /**
   * @virtual optional
   * @type {Object}
   */
  scrollPosition: initialScrollPosition,

  /**
   * @type {ComputedProperty<Boolean>}
   */
  renderedInSafari: equal('browser.browser.browserCode', raw('safari')),

  /**
   * @type {ComputedProperty<String>}
   */
  edgeScrollClasses: computed(
    'edgeScrollState',
    function edgeScrollClasses() {
      const edgeScrollState = this.get('edgeScrollState');
      return Object.keys(edgeScrollState)
        .filter(side => edgeScrollState[side])
        .map(side => `scroll-on-${side}`)
        .join(' ');
    }
  ),

  scrollPositionObserver: observer('scrollPosition', function scrollPositionObserver() {
    this.recalculateTableLayout();
  }),

  didInsertElement() {
    this._super(...arguments);

    // After inserting element it should always be scrolled to the beginning (0, 0).
    // But Firefox has a mechanism, which scrolls elements to the previous scroll position
    // after page reload. Due to that issue, we need to update scroll position after
    // element insertion.
    this.updateScrollPosition();
  },

  didRender() {
    this._super(...arguments);
    this.recalculateTableLayout();
    this.updateSize();
  },

  /**
   * @override
   */
  onWindowResize() {
    this.recalculateTableLayout();
    this.updateSize();
  },

  recalculateTableLayout() {
    const {
      element,
      scrollPosition,
    } = this.getProperties('element', 'scrollPosition');
    if (!element) {
      return;
    }
    const $columnLabels = $(element).find('> .ps > table > tr > .column-label:not(.row-label)');
    const $rowLabels = $(element).find('> .ps > table > tr > .row-label:not(.column-label)');
    const $columnAndRowLabels = $(element).find('> .ps > table > tr > .row-label.column-label');

    // For the origin or translateZ property usage see comments in scrollable-table.scss.
    $columnLabels.css({
      transform: `translateZ(2px) translateY(${scrollPosition.top}px)`,
    });
    $rowLabels.css({
      transform: `translateZ(1px) translateX(${scrollPosition.left}px)`,
    });
    $columnAndRowLabels.css({
      transform: `translateZ(3px) translateY(${scrollPosition.top}px)`,
    });
    // The content of row-column labels is positioned on X axis, because X axis
    // positioning of the table cell breaks down scroll shadows.
    $columnAndRowLabels.find('> *').css({
      transform: `translateX(${scrollPosition.left}px)`,
    });
  },

  updateScrollPosition() {
    const {
      disableScroll,
      element,
    } = this.getProperties('disableScroll', 'element');

    if (!disableScroll && element) {
      const $ps = $(element.querySelector('.ps'));
      this.set('scrollPosition', {
        top: $ps.scrollTop(),
        left: $ps.scrollLeft(),
      });
    }
  },

  updateSize() {
    const {
      disableScroll,
      element,
      size,
    } = this.getProperties('disableScroll', 'element', 'size');

    if (!disableScroll && element) {
      const boundingRect = element.getBoundingClientRect();
      const newSize = {
        width: boundingRect.width,
        height: boundingRect.height,
      };

      if (size.width !== newSize.width || size.height !== newSize.height) {
        this.set('size', {
          width: boundingRect.width,
          height: boundingRect.height,
        });
      }
    }
  },

  actions: {
    scroll() {
      this.updateScrollPosition();
      this.get('onScroll')();
    },
    edgeScroll(edgeScrollState) {
      if (!this.get('disableScroll')) {
        this.set('edgeScrollState', edgeScrollState);
      }
    },
  },
});
