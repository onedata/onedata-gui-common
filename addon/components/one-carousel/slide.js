/**
 * A single slide component used by one-carousel. Needs `slideId` to be defined
 * during the creation in hbs.
 *
 * @module components/one-carousel/slide
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from '../../templates/components/one-carousel/slide';
import { getBy, or, raw, string } from 'ember-awesome-macros';

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
   * @type {ComputedProperty<String>}
   */
  // eslint-disable-next-line ember/no-string-prototype-extensions
  state: string.dasherize(or(getBy('slidesState', 'slideId'), raw('hidden'))),
});
