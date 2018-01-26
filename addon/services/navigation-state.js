import Service, { inject as service } from '@ember/service';
import EmberObject from '@ember/object';
import computed, { reads } from '@ember/object/computed';

import I18n from 'onedata-gui-common/mixins/components/i18n';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import { reject } from 'rsvp';

export default Service.extend(I18n, {
  contentResources: service(),
  router: service(),
  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'tabs',

  /**
   * Type of resource, that will be rendered.
   * @type {string}
   */
  activeResourceType: computed('router.{currentURL,currentRouteName}', function () {
    return this._getRouteParam('onedata.sidebar', 'type');
  }),

  /**
   * Active resource id used to render content.
   * @type {string|undefined}
   */
  activeResourceId: computed('router.{currentURL,currentRouteName}', function () {
    return this._getRouteParam('onedata.sidebar.content', 'resourceId');
  }),

  /**
   * Active resource promise proxy used to render content.
   * @type {PromiseObject<object>}
   */
  activeResourceProxy: computed('activeResourceType', 'activeResourceId', function () {
    const {
      activeResourceId,
      activeResourceType,
    } = this.getProperties('activeResourceId','activeResourceType');

    const promise = activeResourceId ?
      this.get('contentResources').getModelFor(
        activeResourceType,
        activeResourceId
      ) : reject();
      return PromiseObject.create({ promise });
  }),

  /**
   * Active resource used to render content.
   * @type {object|undefined}
   */
  activeResource: reads('activeResourceProxy.content'),

  /**
   * Active aspect of resource.
   * @type {string}
   */
  activeAspect: computed('router.{currentURL,currentRouteName}', function () {
    return this._getRouteParam('onedata.sidebar.content.aspect', 'aspectId');
  }),

  /**
   * One of: 'sidebar', 'index', 'aspect', undefined.
   * @type {string|undefined}
   */
  activeContentLevel: computed('activeAspect', function () {
    const router = this.get('router');
    if (router.get('currentRouteName') === 'onedata.sidebar.index') {
      return 'sidebar';
    } else {
      const aspect = this.get('activeAspect');
      if (aspect) {
        return aspect === 'index' ? 'index' : 'aspect';
      }
      else {
        return undefined;
      }
    }
  }),

  /**
   * DOM selectors to global menu trigger buttons.
   * @type {Ember.ComputedProperty<EmberObject>}
   */
  globalMenuSelector: computed(function () {
    return EmberObject.create({
      sidebar: '.global-sidebar-menu',
      content: '.global-content-menu',
    });
  }),

  /**
   * Specifies if global menu trigger buttons should be visible.
   * @type {Ember.ComputedProperty<EmberObject>}
   */
  showGlobalMenu: computed(function () {
    return EmberObject.create({
      sidebar: false,
      content: false,
    });
  }),

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

  /**
   * Returns param for given route path
   * @param {string} path 
   * @param {string} paramName 
   * @returns {string|undefined}
   */
  _getRouteParam(path, paramName) {
    const router = this.get('router');
    if (router.get('currentRouteName').startsWith(path)) {
      const routeParams = router.get('targetState.routerJsState.params');
      const pathParams = routeParams[path];
      return pathParams ? pathParams[paramName] : undefined;
    } else {
      return undefined;
    }
  }
});
