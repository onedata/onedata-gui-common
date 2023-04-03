/**
 * Displays arrow with optional text.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2019-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import layout from '../templates/components/one-arrow';

export default Component.extend({
  layout,
  classNames: ['one-arrow'],
  classNameBindings: ['directionClass'],

  /**
   * One of: `left`, `right`
   * @virtual
   * @type {string}
   */
  direction: 'right',

  /**
   * Text, that will be placed above arrow
   * @virtual optional
   * @type {string}
   */
  arrowText: undefined,

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  directionClass: computed('direction', function directionClass() {
    return `direction-${this.get('direction')}`;
  }),
});
