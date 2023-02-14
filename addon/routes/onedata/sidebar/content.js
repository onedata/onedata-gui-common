/**
 * A route for loading a view associated with some specific resource
 *
 * It is a dynamic-segment route - it gets a resource ID and uses services to
 * load data from backend associated with selected resource. However, the model
 * resolves not only with resource but with an additional info about it (see
 * ``model`` method).
 *
 * It uses templates from ``tabs`` directory and renders a generic content
 * layout as well as specific content from the tabs.
 *
 * Beside of regular resource IDs, special ids for special views are used:
 * - empty - when there is no resourceId at all to load, this ID is used to show
 *   some welcome info
 * - new - when a creation of new resouce should take whole content view
 *
 * @module routes/onedata/sidebar/content
 * @author Jakub Liput
 * @copyright (C) 2017-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Route from '@ember/routing/route';

import { inject as service } from '@ember/service';
import { Promise, resolve } from 'rsvp';
import { get, setProperties } from '@ember/object';
import isRecord from 'onedata-gui-common/utils/is-record';
import { scheduleOnce } from '@ember/runloop';

/**
 * @typedef {'empty'|'add'|'new'|'join'|'not-selected'|'null'} SpecialResourceId
 */

// TODO: refactor to create route-, or application-specific special ids
/**
 * @type {Array<SpecialResourceId>}
 */
const SPECIAL_IDS = [
  'empty',
  'add',
  'new',
  'join',
  'not-selected',
  'null',
];

function isSpecialResourceId(id) {
  return SPECIAL_IDS.indexOf(id) !== -1;
}

export default Route.extend({
  contentResources: service(),
  navigationState: service(),

  beforeModel(transition) {
    const superResult = this._super(...arguments);
    const navigationState = this.get('navigationState');
    if (navigationState.get('globalSidenavResourceType')) {
      navigationState.set('globalSidenavResourceType', null);
    }
    navigationState.updateQueryParams(transition);
    setProperties(navigationState, {
      activeResourceId: undefined,
      isActiveResourceIdSpecial: false,
      isActiveResourceLoading: false,
    });
    return superResult;
  },

  model({ resource_id: resourceId }, transition) {
    // TODO: validate and use resourceType
    const {
      collection,
      resourceType,
    } = this.modelFor('onedata.sidebar');

    const navigationState = this.get('navigationState');
    const queryParams = transition.to.queryParams;

    if (isSpecialResourceId(resourceId)) {
      setProperties(navigationState, {
        isActiveResourceIdSpecial: true,
        activeResourceId: resourceId,
      });
      if (resourceId === 'null' ||
        (resourceId === 'empty' && get(collection, 'list.length'))) {
        this.transitionTo('onedata.sidebar.index');
        return;
      } else {
        return { resourceId, collection, queryParams };
      }
    } else {
      const existingResourceId = this.availableResourceId(resourceId, collection);
      this.set('navigationState.activeResourceId', existingResourceId);
      if (existingResourceId) {
        return new Promise((resolve, reject) => {
          const gettingResource = this.get('contentResources')
            .getModelFor(resourceType, existingResourceId);
          gettingResource.then(resource => resolve({
            resourceId: existingResourceId,
            resource,
            collection,
            queryParams,
          }));
          gettingResource.catch(reject);
        });
      } else {
        // if the resource to load is not present on the list,
        // try to guess it's ID and try to fetch it to detect why it isn't
        // available - eg. because of forbidden error that should be passed
        // to route model
        const presumableGri = this.findOutResourceId(resourceId, resourceType);
        return (presumableGri ?
            this.get('contentResources').getModelFor(resourceType, presumableGri) :
            resolve(null)
          )
          .then(( /* record */ ) => {
            // this is resource that shouldn't be presented to user,
            // because we do not have it on a list anyway
            return { error: { id: 'forbidden' } };
          })
          .catch(error => ({ error }))
          .then(data => {
            const error = data && data.error;
            return {
              resourceId: null,
              resource: null,
              collection,
              queryParams,
              error,
            };
          });
      }
    }
  },

  afterModel(model) {
    this.get('navigationState').setProperties({
      activeResource: model.resource,
      isActiveResourceLoading: false,
    });
  },

  renderTemplate() {
    // render generic content template
    this.render('onedata.sidebar.content', {
      into: 'onedata',
      outlet: 'content',
    });
    scheduleOnce('afterRender', this, 'scrollSidebarToActiveSidebarItem');
  },

  /**
   * Checks if collection contains model with specified resourceId.
   * @param {string} resourceId ID of resource as in URL
   * @param {object} collection collection object
   * @returns {string} id of found model
   */
  availableResourceId(resourceId, collection) {
    let modelId;
    if (isRecord(collection)) {
      modelId = collection.hasMany('list').ids().indexOf(resourceId) > -1 ?
        resourceId : null;
    } else {
      const model = get(collection, 'list')
        .filter(model => get(model, 'id') === resourceId)[0];
      if (model) {
        modelId = get(model, 'id');
      }
    }
    return modelId;
  },

  findOutResourceId(resourceId /* , resourceType */ ) {
    return resourceId;
  },

  scrollSidebarToActiveSidebarItem() {
    const sidebar = document.querySelector('.col-sidebar');
    const sidebarActiveItemNode =
      document.querySelector('.col-sidebar .resource-item.active .item-header');
    if (!sidebarActiveItemNode) {
      return;
    }

    const sidebarBoundingRect = sidebar.getBoundingClientRect();
    const activeItemBoundingRect = sidebarActiveItemNode.getBoundingClientRect();
    const activeItemYInSidebar = activeItemBoundingRect.top - sidebarBoundingRect.top;

    const minAllowedActiveItemY = 0;
    // At least 3/4 of the active item must be visible
    const maxAllowedActiveItemY = sidebarBoundingRect.height -
      activeItemBoundingRect.height * 0.75;
    if (
      activeItemYInSidebar < minAllowedActiveItemY ||
      activeItemYInSidebar > maxAllowedActiveItemY
    ) {
      sidebarActiveItemNode.scrollIntoView();
    }
  },

  actions: {
    error() {
      this.set('navigationState.isActiveResourceLoading', false);
      return true;
    },
  },
});
