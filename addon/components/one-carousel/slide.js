/**
 * A single slide component used by one-carousel. Needs `slideId` to be defined
 * during the creation in hbs.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed, observer, defineProperty } from '@ember/object';
import { dasherize } from '@ember/string';
import layout from '../../templates/components/one-carousel/slide';

export default Component.extend({
  layout,
  classNames: ['one-carousel-slide'],
  classNameBindings: ['state'],
  attributeBindings: ['slideId:data-one-carousel-slide-id'],

  /**
   * @virtual
   * @type {String}
   */
  slideId: undefined,

  /**
   * @virtual set by one-carousel
   * @type {Object}
   * See the same field in one-carousel component
   */
  slidesState: undefined,

  /**
   * Set by `stateSetter`
   * @type {ComputedProperty<String>}
   */
  state: undefined,

  stateSetter: observer('slideId', function stateSetter() {
    const slideStatePath = `slidesState.${this.slideId}`;
    defineProperty(this, 'state', computed(slideStatePath, function state() {
      const currentState = this.get(slideStatePath);
      return dasherize(currentState ?? 'hidden');
    }));
    // Get computed to recalculate its value
    this.state;
  }),

  /**
   * @override
   */
  init() {
    this._super(...arguments);
    this.stateSetter();
  },
});
