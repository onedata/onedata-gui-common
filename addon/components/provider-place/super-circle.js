/**
 * An animated cirlce that should be rendered below provider circle.
 *
 * It denotes that provider is transferring data: in or out.
 *
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import { htmlSafe } from '@ember/string';

export default Component.extend({
  classNames: ['super-circle'],
  classNameBindings: ['isSource:source', 'isDestination:destination'],
  attributeBindings: ['style'],

  /**
   * @type {boolean}
   */
  isSource: false,

  /**
   * @type {boolean}
   */
  isDestination: false,

  /**
   * @virtual
   * @type {string}
   */
  circleColor: '',

  /**
   * Computed provider-specific style
   * @type {ComputedProperty<String>}
   */
  style: computed('circleColor', function style() {
    return htmlSafe(`background-color: ${this.get('circleColor')};`);
  }),
});
