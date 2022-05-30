/**
 * Makes layout for whole application in authorized mode.
 *
 * Renders a main menu, mobile menu and sidebar and content grid. Yields
 * "sidebar" or "content" strings for placing a content for these particular
 * parts of view.
 *
 * @module components/app-layout
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2017-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { reads, equal } from '@ember/object/computed';
import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed, observer } from '@ember/object';
import layout from 'onedata-gui-common/templates/components/app-layout';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import { dasherize } from '@ember/string';

export default Component.extend({
  layout,
  classNames: ['app-layout'],
  classNameBindings: ['pointerEvents.pointerNoneToMainContent'],

  sidebarResources: service(),
  sideMenu: service(),
  scrollState: service(),
  router: service(),
  navigationState: service(),
  guiUtils: service(),
  pointerEvents: service(),

  globalMenuOpened: false,

  withBottomBar: false,

  appGridClass: 'container-fluid app-grid full-height',

  rowAppClass: 'row row-app full-height',

  showMobileSidebar: equal('navigationState.activeContentLevel', 'sidebar'),

  sidenavResourceType: reads('navigationState.globalSidenavResourceType'),

  /**
   * @type {ComputedProperty<String>}
   */
  sidenavContentComponent: computed(
    'sidenavResourceType',
    function sidenavContentComponent() {
      const {
        sidebarResources,
        sidenavResourceType,
      } = this.getProperties('sidebarResources', 'sidenavResourceType');

      return sidebarResources.getSidebarComponentNameFor(sidenavResourceType);
    }
  ),

  /**
   * Creates a proxy model for floating sidebar based on sidenavResourceType
   * @type {PromiseObject|null}
   */
  sidenavModel: computed('sidenavResourceType', function () {
    const {
      sidenavResourceType,
      sidebarResources,
    } = this.getProperties('sidenavResourceType', 'sidebarResources');

    const resourceType = sidenavResourceType;
    if (resourceType != null) {
      return PromiseObject.create({
        promise: sidebarResources.getSidebarModelFor(resourceType),
      });
    } else {
      return null;
    }
  }),

  brandInfoClasses: computed(
    'navigationState.mainMenuColumnExpanded',
    'showMobileSidebar',
    'withBottomBar',
    function brandInfoClasses() {
      const base = [];
      const {
        showMobileSidebar,
        withBottomBar,
      } = this.getProperties('showMobileSidebar', 'withBottomBar');
      if (withBottomBar) {
        base.push('hidden');
      } else {
        const xsClass = (showMobileSidebar ? 'col-xs-12' : 'hidden-xs');
        base.push(xsClass);
      }
      if (this.get('navigationState.mainMenuColumnExpanded')) {
        base.push('with-place-for-menu');
      }
      return base.join(' ');
    }
  ),

  colSidebarClassArray: computed(
    'showMobileSidebar',
    'withBottomBar',
    'navigationState.mainMenuColumnExpanded',
    function colSidebarClass() {
      const showMobileSidebar = this.get('showMobileSidebar');
      const base = ['col-sidebar', 'full-height', 'disable-user-select'];
      if (this.get('withBottomBar')) {
        base.push('hidden');
      } else {
        const xsClass = (showMobileSidebar ? 'col-xs-12' : 'hidden-xs');
        base.push(xsClass);
      }
      if (this.get('navigationState.mainMenuColumnExpanded')) {
        base.push('with-place-for-menu');
      }
      return base;
    }
  ),

  /**
   * Using this as a workaround to bug in perfect-scrollbar-element
   * which destroys scrollbar when class property is changed in HBS
   */
  sidebarClassObserver: observer(
    'colSidebarClassArray',
    function moveSidebar() {
      const {
        colSidebarClassArray,
        element,
      } = this.getProperties('colSidebarClassArray', 'element');
      const colSidebar = element.querySelector('#col-sidebar');
      if (!colSidebar) {
        return;
      }
      const knownColSidebarClasses = [
        'col-sidebar',
        'full-height',
        'disable-user-select',
        'hidden',
        'col-xs-12',
        'hidden-xs',
        'with-place-for-menu',
      ];
      knownColSidebarClasses.forEach(cls => {
        colSidebar.classList.remove(cls);
      });
      colSidebarClassArray.forEach(cls => {
        colSidebar.classList.add(cls);
      });
    }
  ),

  init() {
    this._super(...arguments);
    // activate observer
    this.get('colSidebarClassArray');
  },

  didInsertElement() {
    this._super(...arguments);
    this.sidebarClassObserver();
  },

  actions: {
    mobileMenuItemChanged(menuItemId) {
      this.get('sideMenu').close();
      const isUsersRemoteView = menuItemId === 'users' &&
        this.get('guiUtils.manageAccountExternalLink');
      if (menuItemId && !isUsersRemoteView) {
        return this.get('router')
          .transitionTo('onedata.sidebar', dasherize(menuItemId));
      }
    },
    scrollOccurred(event) {
      this.get('scrollState').scrollOccurred(event);
    },
    toggleGlobalMenu(opened) {
      if (opened !== this.get('globalMenuOpened')) {
        this.set('globalMenuOpened', opened);
      }
    },
  },
});
