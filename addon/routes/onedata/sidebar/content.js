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
 * @author Jakub Liput
 * @copyright (C) 2017-2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Route from '@ember/routing/route';

import { inject as service } from '@ember/service';
import { resolve } from 'rsvp';
import { get, setProperties } from '@ember/object';
import { scheduleOnce } from '@ember/runloop';
import globals from 'onedata-gui-common/utils/globals';

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
  navigationTabsConfiguration: service(),

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

  async model({ resource_id: resourceId }, transition) {
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
      // TODO: VFS-12506 Special case for shares, which currently is only model with
      // infinite scroll - refactor to do it in generic way
      let existingResourceId;
      if (resourceType === 'shares') {
        existingResourceId = `share.${resourceId}.instance:private`;
      } else {
        existingResourceId = this.availableResourceId(resourceId, collection);
      }
      this.set('navigationState.activeResourceId', existingResourceId);
      if (existingResourceId) {
        const resource = await this.contentResources
          .getModelFor(resourceType, existingResourceId);
        // TODO: VFS-12506 draft of code to jump to share opened with URL (not working);
        // re-implement or remove it
        // if (resource.index && collection.chunksArray) {
        //   (async () => {
        //     await collection.chunksArray.scheduleJump(resource.index, 50);
        //     await waitForRender();
        //     const item = document.querySelector(
        //       `.one-sidebar .resource-item[data-row-id="${resource.entityId}"]`);
        //     if (item) {
        //       item.scrollIntoView({ block: 'center' });
        //     }
        //   })();
        // }
        return {
          resourceId: existingResourceId,
          resource,
          collection,
          queryParams,
        };
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
    const sidebarModel = this.modelFor('onedata.sidebar');
    if (!isSpecialResourceId(model.resourceId)) {
      this.navigationTabsConfiguration.setLastUsedResource(sidebarModel, model);
    }
    this.navigationState.setProperties({
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
    return collection.ids.includes(resourceId) ? resourceId : null;
  },

  findOutResourceId(resourceId /* , resourceType */ ) {
    return resourceId;
  },

  scrollSidebarToActiveSidebarItem() {
    const sidebar = globals.document.querySelector('.col-sidebar');
    const sidebarActiveItemNode =
      globals.document.querySelector('.col-sidebar .resource-item.active .item-header');
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
