/**
 * Inserts a icon from oneicons font.
 * Typical usage: ``{{one-icon icon='home'}}``
 * @module components/one-icon
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2016-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import layout from 'onedata-gui-common/templates/components/one-icon';
import { htmlSafe } from '@ember/template';

export default Component.extend({
  layout,
  tagName: 'span',
  classNames: ['one-icon', 'oneicon'],
  classNameBindings: ['iconClass'],
  attributeBindings: ['style'],

  /**
   * Icon name (from oneicons font, without `oneicon-` prefix)
   * @virtual
   * @type {string}
   */
  icon: 'checkbox-x',

  /**
   * Icon color
   * @virtual optional
   * @type {string}
   */
  color: '',

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  iconClass: computed('icon', function iconClass() {
    return `oneicon-${this.get('icon')}`;
  }),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  style: computed('color', function style() {
    const color = this.get('color');
    if (color) {
      return htmlSafe(`color: ${color};`);
    }
  }),
});
