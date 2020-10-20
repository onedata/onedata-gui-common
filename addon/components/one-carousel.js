/**
 * Arranges content in carousel slides. At each time only one slide may be visible.
 * You need to control manually which slide is active now using `activeSlideId` property.
 * Also each slide must have defined `slideId` property.
 *
 * Changing slides won't be corrupted by different slides height - both of changing slides
 * will be taken into account by content flow and scrolling during the animation (so the
 * height of the carousel will be equal to the height of the highest changing slide).
 * When the animation ends, the old slide jumps out of the content flow and does not
 * preserve any space.
 *
 * Usage example:
 * ```handlebars
 * {{#one-carousel activeSlideId="second" as |carousel|}}
 *   {{#carousel.slide slideId="first"}}
 *     slide 1
 *   {{/carousel.slide}}
 *   {{#carousel.slide slideId="second"}}
 *     slide 2
 *   {{/carousel.slide}}
 * {{/one-carousel}}
 * ```
 *
 * @module components/one-carousel
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from '../templates/components/one-carousel';
import { observer } from '@ember/object';

export default Component.extend({
  layout,
  classNames: ['one-carousel'],

  /**
   * @virtual
   * @type {String}
   */
  activeSlideId: undefined,

  /**
   * slideId: String -> slideState: String
   * If some slide is not mentioned in this mapping, then it is hidden by default
   * @type {Object}
   */
  slidesState: undefined,

  activeSlideIdObserver: observer('activeSlideId', function activeSlideIdObserver() {
    this.recalculateSlidesState();
  }),

  init() {
    this._super(...arguments);
    this.recalculateSlidesState();
  },

  recalculateSlidesState() {
    const oldSlidesState = this.get('slidesState') || {};
    const oldActiveSlideId = Object.keys(oldSlidesState)
      .find(key => oldSlidesState[key].startsWith('active'));
    const newActiveSlideId = this.get('activeSlideId');
    let newSlidesState;

    const slidesOrder = this.getSlidesOrder();
    const oldActiveSlidePosition =
      oldActiveSlideId ? slidesOrder.indexOf(oldActiveSlideId) : -1;
    const newActiveSlidePosition =
      newActiveSlideId ? slidesOrder.indexOf(newActiveSlideId) : -1;

    if (oldActiveSlidePosition === -1 || newActiveSlidePosition === -1) {
      // Previous or next active slide does not exist. No animation is needed
      newSlidesState = newActiveSlideId ? {
        [newActiveSlideId]: 'active',
      } : {};
    } else {
      const isNewActiveAfterOld = newActiveSlidePosition > oldActiveSlidePosition;
      newSlidesState = {
        [oldActiveSlideId]: isNewActiveAfterOld ? 'hiddenToLeft' : 'hiddenToRight',
        [newActiveSlideId]: isNewActiveAfterOld ? 'activeFromRight' : 'activeFromLeft',
      };
    }

    this.set('slidesState', newSlidesState);
  },

  /**
   * @returns {Array<String>}
   */
  getSlidesOrder() {
    const element = this.get('element');
    if (element) {
      return [...element.children]
        .filter(node => node.classList.contains('one-carousel-slide'))
        .map(slideNode => slideNode.getAttribute('data-one-carousel-slide-id'))
        .compact();
    } else {
      return [];
    }
  },
});
