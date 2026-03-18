/**
 * Container for application main menu used as a one of the layout columns.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2018-2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { observer } from '@ember/object';
import { reads } from '@ember/object/computed';
import layout from '../templates/components/main-menu-column';
import $ from 'jquery';
import { dasherize } from '@ember/string';
import I18n from 'onedata-gui-common/mixins/i18n';

export default Component.extend(I18n, {
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
   * @override
   */
  i18nPrefix: 'components.mainMenuColumn',

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
   * @type {(() => void) | null}
   */
  mouseEnterHandler: null,

  /**
   * @type {(() => void) | null}
   */
  mouseLeaveHandler: null,

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  isExpandedObserver: observer('isExpanded', function isExpandedObserver() {
    const {
      lastIsExpandedValue,
      isExpanded,
      element,
    } = this.getProperties('lastIsExpandedValue', 'isExpanded', 'element');
    if (lastIsExpandedValue !== isExpanded) {
      this.set('lastIsExpandedValue', isExpanded);
      if (!this.get('isExpanded')) {
        const $mainMenuContainer = $(element.querySelector('.main-menu-content'));
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

  /**
   * @override
   */
  didInsertElement() {
    this._super(...arguments);

    if (!this.element) {
      return;
    }

    this.setProperties({
      mouseEnterHandler: () => {
        this.set('navigationState.isMainMenuColumnHovered', true);
      },
      mouseLeaveHandler: () => {
        this.set('navigationState.isMainMenuColumnHovered', false);
      },
    });
    this.element.addEventListener('mouseenter', this.mouseEnterHandler);
    this.element.addEventListener('mouseleave', this.mouseLeaveHandler);
  },

  /**
   * @override
   */
  willDestroyElement() {
    try {
      if (this.mouseEnterHandler) {
        this.element?.removeEventListener('mouseenter', this.mouseEnterHandler);
      }
      if (this.mouseLeaveHandler) {
        this.element?.removeEventListener('mouseleave', this.mouseLeaveHandler);
      }
    } finally {
      this._super(...arguments);
    }
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
      const clickedResourceType = dasherize(itemId);
      if (
        (
          !globalSidenavResourceType &&
          activeResourceType !== clickedResourceType
        ) || (
          globalSidenavResourceType &&
          globalSidenavResourceType !== clickedResourceType
        )
      ) {
        this.set('navigationState.globalSidenavResourceType', clickedResourceType);
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
    },
  },
});
