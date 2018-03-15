/**
 * Container for application main menu used as a one of the layout columns.
 *
 * @module components/main-menu-column
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { inject as service } from '@ember/service';
import layout from '../templates/components/main-menu-column';

export default Component.extend({
  layout,
  classNames: [
    'main-menu-column',
    'col-in-app-layout',
    'col-main-menu',
    'hidden-xs',
    'hidden-sm',
    'full-height',
    'disable-user-select',
  ],
  classNameBindings: ['sidenavTabId:sidenav-opened'],

  scrollState: service(),
  navigationState: service(),
  router: service(),

  /**
   * @type {Array<object>}
   */
  mainMenuItems: null,

  click() {
    this.send('closeSidenav');
  },

  actions: {
    mainMenuItemClicked(itemId) {
      const navigationState = this.get('navigationState');
      const {
        activeResourceType,
        globalSidenavResourceType,
      } = navigationState.getProperties('activeResourceType', 'globalSidenavResourceType');
      if ((!globalSidenavResourceType && activeResourceType !== itemId) ||
        (globalSidenavResourceType && globalSidenavResourceType !== itemId)) {
         this.set('navigationState.globalSidenavResourceType', itemId); 
      } else {
        this.set('navigationState.globalSidenavResourceType', null);
      }
    },
    closeSidenav() {
      this.set('navigationState.globalSidenavResourceType', null);
    },
    scrollOccurred(event) {
      this.get('scrollState').scrollOccurred(event);
    },
    manageAccount() {
      this.get('router').transitionTo('onedata.sidebar', 'users');
    },
  },
});
