/**
 * Application main menu component.
 *
 * @module components/main-menu-column
 * @author Jakub Liput, Michal Borzecki
 * @copyright (C) 2017-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import layout from 'onedata-gui-common/templates/components/main-menu';

export default Component.extend({
  layout,
  tagName: 'ul',
  classNames: ['main-menu', 'one-list'],
  classNameBindings: [
    'navigationState.globalSidenavResourceType:sidenav-opened',
  ],

  mainMenu: service(),
  navigationState: service(),

  /**
   * @type {Array<object>}
   */
  items: null,

  /**
   * @type {function}
   * @param {string} id
   * @return {undefined}
   */
  itemClicked: () => {},

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  isLoadingItem: reads('mainMenu.isLoadingItem'),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  isFailedItem: reads('mainMenu.isFailedItem'),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  currentItemId: reads('navigationState.activeResourceType'),

  actions: {
    itemClicked({ id }) {
      this.get('itemClicked')(id);
    }
  }
});
