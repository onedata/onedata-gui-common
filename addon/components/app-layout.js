/**
 * Makes layout for whole application in authorized mode.
 *
 * Renders a main menu, mobile menu and sidebar and content grid. Yields
 * "sidebar" or "content" strings for placing a content for these particular
 * parts of view.
 *
 * @module components/app-layout
 * @author Jakub Liput, Michal Borzecki
 * @copyright (C) 2017-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { reads } from '@ember/object/computed';
import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed, observer } from '@ember/object';
import layout from 'onedata-gui-common/templates/components/app-layout';
import { invokeAction, invoke } from 'ember-invoke-action';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';

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

  showMobileSidebar: computed.equal('navigationState.activeContentLevel', 'sidebar'),

  sidenavResouceType: reads('navigationState.globalSidenavResourceType'),

  sidenavContentComponent: computed('sidenavResouceType', function () {
    return `sidebar-${this.get('sidenavResouceType')}`;
  }),

  /**
   * Creates a proxy model for floating sidebar based on sidenavResouceType
   * @type {PromiseObject|null}
   */
  sidenavModel: computed('sidenavResouceType', function () {
    const {
      sidenavResouceType,
      sidebarResources
    } = this.getProperties('sidenavResouceType', 'sidebarResources');

    const resourceType = sidenavResouceType;
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
    function brandInfoClasses() {
      const base = [];
      const showMobileSidebar = this.get('showMobileSidebar');
      const withBottomBar = this.get('withBottomBar');
      if (withBottomBar) {
        base.push('hidden');
      } else {
        let xsClass = (showMobileSidebar ? 'col-xs-12' : 'hidden-xs');
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
        let xsClass = (showMobileSidebar ? 'col-xs-12' : 'hidden-xs');
        base.push(xsClass);
      }
      if (this.get('navigationState.mainMenuColumnExpanded')) {
        base.push('with-place-for-menu');
      }
      return base;
    }
  ),

  contentScrollResetObserver: observer(
    'navigationState.{activeResourceType,activeResource,activeAspect}',
    function contentScrollResetObserver() {
      this.$('.col-content').scrollTop(0);
    }
  ),

  /**
   * Using this as a workaround to bug in perfect-scrollbar-element
   * which destroys scrollbar when class property is changed in HBS
   */
  sidebarClassObserver: observer(
    'colSidebarClassArray',
    function moveSidebar() {
      const colSidebarClassArray = this.get('colSidebarClassArray');
      const $colSidebar = this.$('#col-sidebar');
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
        $colSidebar.removeClass(cls);
      });
      colSidebarClassArray.forEach(cls => {
        $colSidebar.addClass(cls);
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
    mobileMenuItemChanged(itemId) {
      this.get('sideMenu').close();
      return this.get('router').transitionTo('onedata.sidebar', itemId);
    },
    manageAccount() {
      if (!this.get('guiUtils.manageAccountExternalLink')) {
        invoke(this, 'mobileMenuItemChanged', 'users');
      }
    },
    changeResourceId() {
      return invokeAction(this, 'changeResourceId', ...arguments);
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
