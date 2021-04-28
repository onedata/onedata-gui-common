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
 * @copyright (C) 2018-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service, { inject as service } from '@ember/service';
import EmberObject, { computed, observer, get } from '@ember/object';
import { gt, or } from '@ember/object/computed';
import { later, cancel } from '@ember/runloop';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import _ from 'lodash';
import { resolve, Promise } from 'rsvp';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { next } from '@ember/runloop';

/**
 * @typedef {object} Action
 * @property {function} action
 * @property {string} class
 * @property {string} title
 */

const aspectOptionsDelimiterRe = /\.\.+/;
const aspectOptionsDelimiter = '..';
const aspectOptionsValueDelimiter = '.';

export function parseAspectOptions(optionsString) {
  const parsedOptions = {};
  if (optionsString) {
    optionsString.split(aspectOptionsDelimiterRe).forEach(option => {
      const [key, value] = option.split(aspectOptionsValueDelimiter);
      parsedOptions[key] = value;
    });
  }
  return parsedOptions;
}

export function serializeAspectOptions(options) {
  let optionsArray = [];
  for (let key in options) {
    if (options.hasOwnProperty(key)) {
      optionsArray.push(`${key}${aspectOptionsValueDelimiter}${options[key]}`);
    }
  }
  return optionsArray.join(aspectOptionsDelimiter);
}

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
   * If true, then activeResourceId is a special id not related to any model.
   * Examples: 'empty', 'new'
   * @type {boolean}
   */
  isActiveResourceIdSpecial: false,

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

  aspectOptions: Object.freeze({}),

  /**
   * @type {String}
   */
  aspectOptionsString: computed('aspectOptions', {
    get() {
      return serializeAspectOptions(this.get('aspectOptions'));
    },
    set(key, value) {
      const aspectOptions = this.set('aspectOptions', parseAspectOptions(value));
      return serializeAspectOptions(aspectOptions);
    },
  }),

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
  resourceTypeActions: computed(
    'activeResourceType',
    'activeResourceCollection.list.[]',
    function () {
      const {
        sidebarResources,
        activeResourceType,
        activeResourceCollection,
      } = this.getProperties(
        'sidebarResources',
        'activeResourceType',
        'activeResourceCollection'
      );

      const collection = get(activeResourceCollection || {}, 'list');
      return sidebarResources.getButtonsFor(activeResourceType, {
        collection,
        // In global view we assume, that all items are visible - we cannot guess any
        // filtering from this point.
        visibleCollection: collection,
      });
    }
  ),

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
  globalBarSidebarTitle: computed(
    'activeResourceType',
    function globalBarSidebarTitle() {
      return this.get('i18n').t(`tabs.${_.camelCase(this.get('activeResourceType'))}.menuItem`);
    }
  ),

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
      this.t(`${_.camelCase(activeResourceType)}.aspects.${_.camelCase(activeAspect)}`) : '';
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

  activeResourceCollectionObserver: observer(
    'activeResourceCollection.list.[]',
    function () {
      const {
        activeResourceId,
        isActiveResourceIdSpecial,
        activeResourceCollection,
      } = this.getProperties(
        'activeResourceId',
        'isActiveResourceIdSpecial',
        'activeResourceCollection'
      );
      const isEmptyOrNotSpecial = !isActiveResourceIdSpecial ||
        (isActiveResourceIdSpecial && activeResourceId === 'empty');
      if (activeResourceId && activeResourceCollection && isEmptyOrNotSpecial) {
        this.resourceCollectionContainsId(activeResourceId).then(contains => {
          if (!contains) {
            this.get('router').transitionTo('onedata.sidebar');
          }
        });
      }
    }
  ),

  mergedAspectOptions(options) {
    const newAspectOptions = Object.assign({}, this.get('aspectOptions'), options);
    for (let key in options) {
      if (options.hasOwnProperty(key)) {
        const value = options[key];
        if (value === null) {
          delete newAspectOptions[key];
        }
      }
    }
    return newAspectOptions;
  },

  setAspectOptions(options) {
    return this.set('aspectOptions', Object.freeze(this.mergedAspectOptions(options)));
  },

  changeRouteAspectOptions(options, replaceHistory = false) {
    const newOptions = serializeAspectOptions(this.mergedAspectOptions(options));
    const routerMethod = replaceHistory ? 'replaceWith' : 'transitionTo';
    return this.get('router')[routerMethod]({ queryParams: { options: newOptions } });
  },

  /**
   * Resolves to true if activeResourceCollections contains model with passed id
   * @param {string} id
   * @returns {Promise<Boolean>}
   */
  resourceCollectionContainsId(id) {
    return get(this.get('activeResourceCollection'), 'list')
      .then(list => !!list.findBy('id', id));
  },

  /**
   * Redirects to the index of resources type when current resource does not exist.
   * Useful e.g. after removing record.
   * @returns {Promise}
   */
  redirectToCollectionIfResourceNotExist() {
    const {
      router,
      activeResourceType,
    } = this.getProperties('router', 'activeResourceType');
    const activeResourceId = this.get('activeResource.id');
    if (!activeResourceId) {
      return resolve();
    }

    return this.resourceCollectionContainsId(activeResourceId)
      .then(contains => {
        if (!contains) {
          return new Promise(resolve => {
            next(() =>
              router.transitionTo('onedata.sidebar', activeResourceType).finally(resolve)
            );
          });
        }
      });
  },

  /**
   * Updates queryParams if those available in transition are different than actual
   * @param {Transition} transition
   */
  updateQueryParams(transition) {
    const queryParams = get(transition, 'queryParams');
    if (!_.isEqual(queryParams, this.get('queryParams'))) {
      this.set('queryParams', _.assign({}, queryParams));
    }
  },

  _globalSidebarClosed() {
    safeExec(this, 'setProperties', {
      isGlobalSidenavClosing: false,
      _isGlobalSidenavClosingTimer: undefined,
    });
  },
});
