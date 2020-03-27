/**
 * Sidebar button component.
 *
 * @module services/one-sidebar-toolbar-button
 * @author Jakub Liput, Michal Borzecki
 * @copyright (C) 2017-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { readOnly } from '@ember/object/computed';
import { observer } from '@ember/object';
import Component from '@ember/component';
import layout from 'onedata-gui-common/templates/components/one-sidebar-toolbar-button';

export default Component.extend({
  layout,
  classNames: ['one-sidebar-toolbar-button'],
  classNameBindings: [
    'disabled:disabled:clickable',
    'title:has-title',
  ],

  /**
   * Button definition
   * @type {object}
   */
  buttonModel: null,

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  title: readOnly('buttonModel.sidebarTitle'),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  icon: readOnly('buttonModel.icon'),

  /**
   * @type {Ember.ComputedProperty<function>}
   */
  action: readOnly('buttonModel.action'),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  tip: readOnly('buttonModel.tip'),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  disabled: readOnly('buttonModel.disabled'),

  disabledObserver: observer('disabled', function disabledObserver() {
    const disabled = this.get('disabled');
    this.set('click', disabled ? undefined : this._click);
  }),

  init() {
    this._super(...arguments);
    this.disabledObserver();
  },

  _click() {
    const action = this.get('action');
    if (action) {
      action();
    }
  },
});
