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
  }
} = Ember;

const ObjectPromiseProxy = Ember.ObjectProxy.extend(Ember.PromiseProxyMixin);

const MOBILE_APPLAYOUT_STATE = {
  CONTENT: 1,
  SIDEBAR: 2,
};

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

  // TODO: too much relations: we got mainMenuItemChanged event
  currentTabId: computed.oneWay('mainMenu.currentItemId'),
  sidenavTabId: null,
  sidebarSecondaryItem: null,
  mobileAppLayoutHeader: computed('mobileAppLayoutState', 'currentTabId',
    'sidebarSecondaryItem',
    function () {
      let {
        mobileAppLayoutState,
        currentTabId,
        sidebarSecondaryItem
      } = this.getProperties(
        'mobileAppLayoutState',
        'currentTabId',
        'sidebarSecondaryItem'
      );
      if (mobileAppLayoutState === MOBILE_APPLAYOUT_STATE.SIDEBAR ||
        !sidebarSecondaryItem) {
        return currentTabId;
      } else {
        return sidebarSecondaryItem.label;
      }
    }),
  mobileAppLayoutState: MOBILE_APPLAYOUT_STATE.SIDEBAR,
  showMobileSidebar: computed.equal('mobileAppLayoutState', MOBILE_APPLAYOUT_STATE.SIDEBAR),

  sidenavContentComponent: computed('sidenavTabId', function () {
    let sidenavTabId = this.get('sidenavTabId');
    return `sidebar-${sidenavTabId}`;
  }),

  /**
   * Creates a proxy model for floating sidebar based on selected sidenavTabId
   * @type {ObjectPromiseProxy|null}
   */
  sidenavModel: computed('sidenavTabId', function () {
    let {
      sidenavTabId,
      sidebarResources
    } = this.getProperties('sidenavTabId', 'sidebarResources');

    let resourceType = sidenavTabId;

    if (resourceType != null) {
      let gettingModel = sidebarResources.getCollectionFor(resourceType);
      let promise = new Promise((resolve, reject) => {
        gettingModel.then(collection => {
          resolve({
            resourceType,
            collection
          });
        });
        gettingModel.catch(reject);
      });
      return ObjectPromiseProxy.create({ promise });
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
      this.set('mobileAppLayoutState', MOBILE_APPLAYOUT_STATE.CONTENT);
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
      this.set('mobileAppLayoutState', MOBILE_APPLAYOUT_STATE.SIDEBAR);
      return invokeAction(this, 'changeTab', itemId);
    },
    showMobileSidebar() {
      return this.set('mobileAppLayoutState', MOBILE_APPLAYOUT_STATE.SIDEBAR);
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
  }
});
