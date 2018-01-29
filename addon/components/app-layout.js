import Ember from 'ember';
import layout from 'onedata-gui-common/templates/components/app-layout';
import { invokeAction, invoke } from 'ember-invoke-action';

const {
  inject: {
    service
  },
  computed,
  RSVP: {
    Promise
  },
  String: {
    htmlSafe
  },
  get,
} = Ember;

import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';

/**
 * Makes layout for whole application in authorized mode.
 *
 * Renders a main menu, mobile menu and sidebar and content grid. Yields
 * "sidebar" or "content" strings for placing a content for these particular
 * parts of view.
 *
 * Invokes actions passed as parameters:
 * - changeTab(itemId: string) - when a content route should be changed
 *
 * @module components/app-layout
 * @author Jakub Liput, Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */
export default Ember.Component.extend({
  layout,
  classNames: ['app-layout'],

  mainMenu: service(),
  sidebarResources: service(),
  eventsBus: service(),
  sideMenu: service(),
  globalCollapsibleToolbar: service(),
  scrollState: service(),
  router: service(),
  navigationState: service(),

  // TODO: too much relations: we got mainMenuItemChanged event
  currentTabId: computed.oneWay('mainMenu.currentItemId'),
  sidenavTabId: null,
  sidebarSecondaryItem: null,
  globalMenuOpened: false,
  showMobileSidebar: computed.equal('navigationState.activeContentLevel', 'sidebar'),

  sidenavContentComponent: computed('sidenavTabId', function () {
    let sidenavTabId = this.get('sidenavTabId');
    return `sidebar-${sidenavTabId}`;
  }),

  /**
   * Creates a proxy model for floating sidebar based on selected sidenavTabId
   * @type {PromiseObject|null}
   */
  sidenavModel: computed('sidenavTabId', function () {
    let {
      sidenavTabId,
      sidebarResources
    } = this.getProperties('sidenavTabId', 'sidebarResources');

    let resourceType = sidenavTabId;

    if (resourceType != null) {
      const promise = sidebarResources.getCollectionFor(resourceType)
        .then(collection => {
          return Promise.all(collection.map(i => get(i, 'promise')))
            .then(() => collection)
        })
        .then(collection => {
          return {
            resourceType,
            collection,
          };
        });
      return PromiseObject.create({ promise });
    } else {
      return null;
    }

  }),

  colSidebarClass: computed('showMobileSidebar', function () {
    let showMobileSidebar = this.get('showMobileSidebar');
    let base =
      'col-sidebar full-height disable-user-select';
    let xsClass = (showMobileSidebar ? 'col-xs-12' : 'hidden-xs');
    return htmlSafe(`${base} ${xsClass}`);
  }),

  colContentClass: 'col-in-app-layout col-content col-xs-12 full-height',

  init() {
    this._super(...arguments);
    const eventsBus = this.get('eventsBus');
    eventsBus.on('one-sidenav:open', (selector) => {
      if (selector === '#sidenav-sidebar') {
        this.set('sidenavSidebarOpen', true);
      }
    });
    eventsBus.on('one-sidenav:close', (selector) => {
      if (selector === '#sidenav-sidebar') {
        this.set('sidenavSidebarOpen', false);
        this.set('sidenavTabId', null);
      }
    });
    eventsBus.on('sidebar:select', (sidebarSecondaryItem) => {
      this.$('.col-content').scrollTop(0);
      this.set('sidebarSecondaryItem', sidebarSecondaryItem);
    });
  },

  didInsertElement() {
    this.$('.col-content').on('scroll', () => {
      this.get('eventsBus').trigger('one-webui-popover:update');
    });
  },

  actions: {
    // TODO IMPORTANT: who is receiver of eventsBus' one-sidenav:open/close?
    closeSidenav() {
      this.get('eventsBus').trigger('one-sidenav:close', '#sidenav-sidebar');
    },
    sidenavClosed() {
      this.set('sidenavItemId', null);
    },
    // TODO IMPORTANT: inconsistent depedencies between component:main-menu, service:main-menu and component:app-layout
    mainMenuItemClicked(itemId) {
      let {
        sidenavTabId,
        currentTabId
      } = this.getProperties('sidenavTabId', 'currentTabId');
      let shouldOpen = (
        (!sidenavTabId && currentTabId !== itemId) ||
        (!!sidenavTabId && sidenavTabId !== itemId)
      );
      let action = (shouldOpen ? 'open' : 'close');
      this.get('eventsBus').trigger('one-sidenav:' + action, '#sidenav-sidebar');
      if (shouldOpen) {
        this.set('sidenavTabId', itemId);
      }
    },
    mobileMenuItemChanged(itemId) {
      let sideMenu = this.get('sideMenu');
      sideMenu.close();
      this.set('sidenavTabId', null);
      return invokeAction(this, 'changeTab', itemId);
    },
    showMobileSidebar() {
      this.get('router').transitionTo('onedata.sidebar.index');
    },
    manageAccount() {
      invoke(this, 'mobileMenuItemChanged', 'users');
      return invokeAction(this, 'manageAccount');
    },
    changeResourceId() {
      return invokeAction(this, 'changeResourceId', ...arguments);
    },
    globalCollapsibleToolbarToggle() {
      this.toggleProperty('globalCollapsibleToolbar.isDropdownOpened');
    },
    scrollOccurred(event) {
      this.get('scrollState').scrollOccurred(event);
    },
    toggleGlobalMenu(opened) {
      if (opened !== this.get('globalMenuOpened')) {
        this.set('globalMenuOpened', opened);
      }
    }
  }
});
