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
import EmberObject, { computed } from '@ember/object';
import { reads, gt } from '@ember/object/computed';

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
   * Type of resource, that will be rendered.
   * @type {string}
   */
  activeResourceType: undefined,

  /**
   * Active resource used  to render content.
   * @type {object|undefined}
   */
  activeResource: undefined,

  /**
   * Active aspect of resource.
   * @type {string|undefined}
   */
  activeAspect: undefined,

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
              const separatorItem = EmberObject.create({
                separator: true,
                title: aspectActionsTitle,
              });
              actions = actions.concat([separatorItem, ...aspectActions])
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
  globalBarSidebarTitle: reads('activeResourceType'),

  /**
   * Global bar title for content index.
   * @type {Ember.ComputedProperty<string>}
   */
  globalBarIndexTitle: reads('activeResource.name'),

  /**
   * Global bar title for content aspect.
   * @type {Ember.ComputedProperty<string>}
   */
  globalBarAspectTitle: computed('activeResourceType', 'activeAspect', function () {
    const {
      activeResourceType,
      activeAspect,
    } = this.getProperties('activeResourceType', 'activeAspect');
    return this.t(`${activeResourceType}.aspects.${activeAspect}`);
  }),

  /**
   * Global bar active title.
   * @type {Ember.ComputedProperty<EmberObject>}
   */
  globalBarActiveTitle: computed(
    'activeContentLevel',
    'globalBarSidebarTitle',
    'globalBarIndexTitle',
    'globalBarAspectTitle',
    function () {
      const {
        activeContentLevel,
        globalBarSidebarTitle,
        globalBarIndexTitle,
        globalBarAspectTitle,
      } = this.getProperties(
        'activeContentLevel',
        'globalBarSidebarTitle',
        'globalBarIndexTitle',
        'globalBarAspectTitle'
      );
      switch (activeContentLevel) {
        case 'sidebar':
        case 'contentIndex':
          return globalBarSidebarTitle;
        case 'index':
          return globalBarIndexTitle;
        case 'aspect':
          return globalBarAspectTitle;
        default:
          return '';
      }
    }
  ),
});
