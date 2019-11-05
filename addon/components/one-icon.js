/**
 * Inserts a icon from oneicons font.
 * Typical usage: ``{{one-icon icon='home'}}``
 * @module components/one-icon
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2016-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { observer, computed } from '@ember/object';
import layout from 'onedata-gui-common/templates/components/one-icon';
import { notEmpty } from '@ember/object/computed';

export default Component.extend({
  layout,
  tagName: 'span',
  classNames: ['one-icon', 'oneicon'],
  classNameBindings: ['iconClass'],

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
   * @type {Ember.ComputedProperty<boolean>}
   */
  hasCustomStyles: notEmpty('color'),

  stylesObserver: observer('color', function stylesObserver() {
    this.applyStyles();
  }),

  didInsertElement() {
    this._super(...arguments);
    if (this.get('hasCustomStyles')) {
      this.applyStyles();
    }
  },

  applyStyles() {
    this.$().css({ color: this.get('color') });
  },
});
