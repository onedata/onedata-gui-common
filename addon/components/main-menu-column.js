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
import { observer } from '@ember/object';
import { reads } from '@ember/object/computed';
import layout from '../templates/components/main-menu-column';
import $ from 'jquery';

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
  classNameBindings: [
    'sidenavTabId:sidenav-opened',
    'isExpanded:expanded:collapsed',
  ],

  scrollState: service(),
  navigationState: service(),
  router: service(),

  /**
   * @type {Array<object>}
   */
  mainMenuItems: null,

  /**
   * @type {boolean}
   */
  userAccountPopoverOpened: false,

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  isExpanded: reads('navigationState.mainMenuColumnExpanded'),

  /**
   * @type {boolean}
   */
  lastIsExpandedValue: false,

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  isExpandedObserver: observer('isExpanded', function isExpandedObserver() {
    const {
      lastIsExpandedValue,
      isExpanded,
    } = this.getProperties('lastIsExpandedValue', 'isExpanded');
    if (lastIsExpandedValue !== isExpanded) {
      this.set('lastIsExpandedValue', isExpanded);
      if (!this.get('isExpanded')) {
        const $mainMenuContainer = this.$('.main-menu-content');
        if ($mainMenuContainer.scrollTop()) {
          $mainMenuContainer.animate({ scrollTop: 0 }, 200);
        }
      }
      // simulate scroll event to rerender all popovers
      this.get('scrollState').scrollOccurred($.Event('ps-scroll-y'));
    }
  }),

  click() {
    this.send('closeSidenav');
  },

  mouseEnter() {
    this.set('navigationState.isMainMenuColumnHovered', true);
  },

  mouseLeave() {
    this.set('navigationState.isMainMenuColumnHovered', false);
  },

  actions: {
    mainMenuItemClicked(itemId) {
      const navigationState = this.get('navigationState');
      const {
        activeResourceType,
        globalSidenavResourceType,
      } = navigationState.getProperties(
        'activeResourceType',
        'globalSidenavResourceType'
      );
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
    userAccountPopoverOpened(opened) {
      this.set('navigationState.isMainMenuColumnActive', opened);
    }
  },
});
