/**
 * Sidebar button component.
 *
 * @module services/one-sidebar-toolbar-button
 * @author Jakub Liput, Michal Borzecki
 * @copyright (C) 2017-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import layout from 'onedata-gui-common/templates/components/one-sidebar-toolbar-button';

export default Component.extend({
  layout,
  classNames: ['one-sidebar-toolbar-button'],

  /**
   * Button definition
   * @type {object}
   */
  buttonModel: null,

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  title: computed.readOnly('buttonModel.title'),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  icon: computed.readOnly('buttonModel.icon'),

  /**
   * @type {Ember.ComputedProperty<function>}
   */
  action: computed.readOnly('buttonModel.action'),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  tip: computed.readOnly('buttonModel.tip'),

  click() {
    const action = this.get('action');
    if (action) {
      action();
    }
  }
});
