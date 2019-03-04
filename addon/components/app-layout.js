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

import { reads, not } from '@ember/object/computed';
import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { htmlSafe } from '@ember/string';
import { computed, observer } from '@ember/object';
import layout from 'onedata-gui-common/templates/components/app-layout';
import { invokeAction, invoke } from 'ember-invoke-action';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';

export default Component.extend({
  layout,
  classNames: ['app-layout'],
  classNameBindings: ['withBottomBar:with-bottom-bar'],

  sidebarResources: service(),
  sideMenu: service(),
  scrollState: service(),
  router: service(),
  navigationState: service(),
  guiUtils: service(),
  deploymentManager: service(),
  media: service(),

  globalMenuOpened: false,
  showMobileSidebar: computed.equal('navigationState.activeContentLevel', 'sidebar'),

  sidenavResouceType: reads('navigationState.globalSidenavResourceType'),

  /**
   * Deployment manager's installationDetails should be available always
   * in `onedata` routes because it is blocking `onedata` model.
   */
  isDeploying: not('deploymentManager.installationDetails.isInitialized'),

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

  withBottomBar: computed(
    'isDeploying',
    'media.{isDesktop,isTablet}',
    function withBottomBar() {
      return this.get('isDeploying') && (
        this.get('media.isDesktop') || this.get('media.isTablet')
      )
    }
  ),

  colSidebarClass: computed('showMobileSidebar', 'withBottomBar', function colSidebarClass() {
    const showMobileSidebar = this.get('showMobileSidebar');
    const base =
      'col-sidebar full-height disable-user-select';
    let finalClass;
    if (this.get('withBottomBar')) {
      finalClass = `${base} hidden`;
    } else {
      let xsClass = (showMobileSidebar ? 'col-xs-12' : 'hidden-xs');
      finalClass = `${base} ${xsClass}`;
    }
    return htmlSafe(finalClass);
  }),

  colMainMenuClass: computed('withBottomBar', function colMainMenuClass() {

  }),

  appGridClass: 'container-fluid app-grid full-height',

  rowAppClass: 'row row-app full-height',

  // FIXME: maybe to remove below

  // appGridClass: computed('isDeploying', function appGridClass() {
  //   const base = 'container-fluid app-grid full-height';
  //   return this.get('isDeploying') ? `${base} full-width` : base;
  // }),

  // rowAppClass: computed('isDeploying', function rowAppClass() {
  //   const base = 'row row-app full-height';
  //   return this.get('isDeploying') ? `${base} full-width` : base;
  // }),

  contentScrollResetObserver: observer(
    'navigationState.{activeResourceType,activeResource,activeAspect}',
    function contentScrollResetObserver() {
      this.$('.col-content').scrollTop(0);
    }
  ),

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
