/**
 * Makes layout for whole application in authorized mode.
 *
 * Renders a main menu, mobile menu and sidebar and content grid. Yields
 * "sidebar" or "content" strings for placing a content for these particular
 * parts of view.
 *
 * @module components/app-layout
 * @author Jakub Liput, Michal Borzecki
 * @copyright (C) 2017-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { reads } from '@ember/object/computed';
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

  sidebarResources: service(),
  sideMenu: service(),
  scrollState: service(),
  router: service(),
  navigationState: service(),

  globalMenuOpened: false,
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

  colSidebarClass: computed('showMobileSidebar', function () {
    let showMobileSidebar = this.get('showMobileSidebar');
    let base =
      'col-sidebar full-height disable-user-select';
    let xsClass = (showMobileSidebar ? 'col-xs-12' : 'hidden-xs');
    return htmlSafe(`${base} ${xsClass}`);
  }),

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
      invoke(this, 'mobileMenuItemChanged', 'users');
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
