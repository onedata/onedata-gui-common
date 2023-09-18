/**
 * Inserts a icon from oneicons font.
 * Typical usage: ``{{one-icon icon='home'}}``
 *
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2016-2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import layout from 'onedata-gui-common/templates/components/one-icon';
import { htmlSafe } from '@ember/template';
import isOneicon from 'onedata-gui-common/utils/is-oneicon';
import config from 'ember-get-config';

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
    if (config.environment !== 'production' && !isOneicon(this.icon)) {
      const message = `Unknown oneicon used: "${this.icon}"`;
      if (config.environment === 'test' && this.icon) {
        throw new Error(message);
      } else {
        console.warn(message);
      }
    }
    return `oneicon-${this.icon}`;
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
