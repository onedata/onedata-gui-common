/**
 * A global state of page navigation. Accumulates data about active content and
 * aspect, generates proper global bar titles, active content level and manages
 * global actions.
 * 
 * To provide custom actions for aspect, aspectActions and aspectActionsTitle
 * should be changed (and changes should be later reverted!).
 *
 * @module services/navigation-state
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service, { inject as service } from '@ember/service';
import EmberObject, { computed, observer } from '@ember/object';
import { gt, or } from '@ember/object/computed';
import { later, cancel } from '@ember/runloop';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import _ from 'lodash';

import I18n from 'onedata-gui-common/mixins/components/i18n';

/**
 * @typedef {object} Action
 * @property {function} action
 * @property {string} class
 * @property {string} title
 */

export default Service.extend(I18n, {
  sidebarResources: service(),
  router: service(),
  i18n: service(),
  media: service(),

  /**
   * Array of actions predefined for active aspect.
   * @virtual
   * @type {Array<Action>}
   */
  aspectActions: Object.freeze([]),

  /**
   * @type {string}
   * @virtual
   */
  aspectActionsTitle: undefined,

  /**
   * @override
   */
  i18nPrefix: 'tabs',

  /**
   * @type {object}
   */
  queryParams: Object.freeze({}),

  /**
   * Type of resource, that will be rendered.
   * @type {string}
   */
  activeResourceType: undefined,

  /**
   * Array of resources related to activeResourceType.
   * @type {Array<object>|undefined}
   */
  activeResourceCollection: undefined,

  /**
   * True, if activeResourceCollection is loading.
   * @type {boolean}
   */
  isActiveResourceCollectionLoading: false,

  /**
   * True, if error occurred while activeResourceCollection loading.
   * @type {boolean}
   */
  hasActiveResourceCollectionLoadingFailed: false,

  /**
   * Active resource id used to render content.
   * @type {string|undefined}
   */
  activeResourceId: undefined,

  /**
   * If true, then activeResource is loading.
   * @type {boolean}
   */
  isActiveResourceLoading: false,

  /**
   * Active resource used to render content.
   * @type {object|undefined}
   */
  activeResource: undefined,

  /**
   * Active aspect of resource.
   * @type {string|undefined}
   */
  activeAspect: undefined,

  /**
   * Resource type used by global sidenav
   * @type {string|undefined}
   */
  globalSidenavResourceType: undefined,

  /**
   * If true, global sidenav is closing
   * @type {boolean}
   */
  isGlobalSidenavClosing: false,

  /**
   * True, if desktop version of main menu is hovered by user.
   * @type {boolean}
   */
  isMainMenuColumnHovered: false,

  /**
   * True, if desktop version of main menu is somehow active (e.g. when popover
   * inside main menu is opened).
   * @type {boolean}
   */
  isMainMenuColumnActive: false,

  /**
   * Height of the global bar
   * @type {Ember.ComputedProperty<number>}
   */
  globalBarHeight: computed('media.{isDesktop,isTablet,isMobile}', function () {
    const media = this.get('media');
    if (media.get('isMobile')) {
      return 75;
    } else if (media.get('isTablet')) {
      return 55;
    } else {
      return 0;
    }
  }),

  /**
   * Timer id used to change isGlobalSidenavClosing property
   * @type {any}
   */
  _isGlobalSidenavClosingTimer: undefined,

  /**
   * If true, desktop version of main menu is expanded.
   * @type {boolean}
   */
  mainMenuColumnExpanded: or(
    'isMainMenuColumnHovered',
    'isMainMenuColumnActive',
    'globalSidenavResourceType',
    'isGlobalSidenavClosing'
  ),

  /**
   * One of: 'sidebar', 'index', 'aspect', undefined.
   * @type {string|undefined}
   */
  activeContentLevel: computed('activeAspect', 'router.currentRouteName', function () {
    const {
      router,
      activeAspect,
    } = this.getProperties('router', 'activeAspect');
    const currentRouteName = router.get('currentRouteName');
    switch (currentRouteName) {
      case 'onedata.sidebar.index':
        return 'sidebar';
      case 'onedata.sidebar.content.index':
        return 'contentIndex';
      case 'onedata.sidebar.content.aspect':
        return activeAspect === 'index' ? 'index' : 'aspect';
      default:
        return undefined;
    }
  }),

  /**
   * @type {Ember.ComputedProperty<Array<Action>>}
   */
  resourceTypeActions: computed('activeResourceType', function () {
    const {
      sidebarResources,
      activeResourceType,
    } = this.getProperties('sidebarResources', 'activeResourceType');
    return sidebarResources.getButtonsFor(activeResourceType);
  }),

  /**
   * @type {Ember.ComputedProperty<Array<Action>>}
   */
  globalMenuActions: computed(
    'resourceTypeActions',
    'aspectActions',
    'aspectActionsTitle',
    'activeContentLevel',
    'media.isTablet',
    function () {
      const {
        resourceTypeActions,
        aspectActions,
        aspectActionsTitle,
        activeContentLevel,
        media,
      } = this.getProperties(
        'resourceTypeActions',
        'aspectActions',
        'aspectActionsTitle',
        'activeContentLevel',
        'media'
      );
      switch (activeContentLevel) {
        case 'sidebar':
        case 'contentIndex':
          return resourceTypeActions;
        case 'index':
        case 'aspect':
          if (media.get('isTablet') &&
            (resourceTypeActions.length || aspectActions.length)) {
            let actions = resourceTypeActions;
            if (aspectActions.length) {
              if (actions.length > 0) {
                const separatorItem = EmberObject.create({
                  separator: true,
                  title: aspectActionsTitle,
                });
                actions = actions.concat([separatorItem]);
              }
              actions = actions.concat(aspectActions);
            }
            return actions;
          } else {
            return aspectActions;
          }
        default:
          return [];
      }
    }
  ),

  /**
   * Specifies if global menu trigger button should be visible.
   * @type {Ember.ComputedProperty<boolean>}
   */
  showGlobalMenuTrigger: gt('globalMenuActions.length', 0),

  /**
   * Global bar title for sidebar.
   * @type {Ember.ComputedProperty<string>}
   */
  globalBarSidebarTitle: computed('activeResourceType', function () {
    return _.upperFirst(this.get('activeResourceType'));
  }),

  /**
   * Global bar title for content aspect.
   * @type {Ember.ComputedProperty<string>}
   */
  globalBarAspectTitle: computed('activeResourceType', 'activeAspect', function () {
    const {
      activeResourceType,
      activeAspect,
    } = this.getProperties('activeResourceType', 'activeAspect');
    return activeResourceType && activeAspect ?
      this.t(`${activeResourceType}.aspects.${_.camelCase(activeAspect)}`) : '';
  }),

  /**
   * Global bar active title.
   * @type {Ember.ComputedProperty<EmberObject>}
   */
  globalBarActiveTitle: computed(
    'activeContentLevel',
    'globalBarSidebarTitle',
    'globalBarAspectTitle',
    function () {
      const {
        activeContentLevel,
        globalBarSidebarTitle,
        globalBarAspectTitle,
      } = this.getProperties(
        'activeContentLevel',
        'globalBarSidebarTitle',
        'globalBarAspectTitle'
      );
      switch (activeContentLevel) {
        case 'sidebar':
        case 'contentIndex':
          return globalBarSidebarTitle;
        case 'index':
        case 'aspect':
          return globalBarAspectTitle;
        default:
          return '';
      }
    }
  ),

  globalSidenavResourceTypeObserver: observer(
    'globalSidenavResourceType',
    function () {
      const {
        globalSidenavResourceType,
        _isGlobalSidenavClosingTimer,
      } = this.getProperties(
        'globalSidenavResourceType',
        '_isGlobalSidenavClosingTimer'
      );
      if (globalSidenavResourceType) {
        this.set('isGlobalSidenavClosing', false);
        if (_isGlobalSidenavClosingTimer !== undefined) {
          cancel(_isGlobalSidenavClosingTimer);
          this.set('_isGlobalSidenavClosingTimer', undefined);
        }
      } else {
        this.setProperties({
          isGlobalSidenavClosing: true,
          _isGlobalSidenavClosingTimer: later(this, '_globalSidebarClosed', 200),
        });
      }
    }
  ),

  _globalSidebarClosed() {
    safeExec(this, 'setProperties', {
      isGlobalSidenavClosing: false,
      _isGlobalSidenavClosingTimer: undefined,
    });
  },
});
