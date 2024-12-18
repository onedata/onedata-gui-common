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
import { get, setProperties } from '@ember/object';
import { scheduleOnce } from '@ember/runloop';
import globals from 'onedata-gui-common/utils/globals';
import waitForRender from 'onedata-gui-common/utils/wait-for-render';

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
      //       const presumableGri = this.findOutResourceId(resourceId, resourceType);

      // FIXME: przywrócić walidację, czy użytkownik ma to na liście?
      // można to zrobić dodatkową funkcją, która będzie korzystać np. z infinite scroll
      // fetch sprawdzającego, czy ten konkretny rekord jest na liście (albo w kolekcji)
      // ale to może być niepotrzebne
      try {
        /**
         * An ID of the real record - can differ from the resourceId which is a short
         * form (eg. SpaceId vs it's GRI)
         */
        const recordId = this.findOutResourceId(resourceId, resourceType);
        if (!recordId) {
          throw { error: { id: 'notFound' } };
        }
        const resource = await this.contentResources.getModelFor(resourceType, recordId);
        this.set('navigationState.activeResourceId', recordId);
        return {
          resourceId,
          resource,
          collection,
          queryParams,
        };
      } catch (error) {
        return {
          resourceId: null,
          resource: null,
          collection,
          queryParams,
          error,
        };
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

  renderTemplate(controller, model) {
    // render generic content template
    this.render('onedata.sidebar.content', {
      into: 'onedata',
      outlet: 'content',
    });
    scheduleOnce('afterRender', this, 'scrollSidebarToActiveSidebarItem', model);
  },

  /**
   * Checks if collection contains model with specified resourceId.   * @param {string} resourceId ID of resource as in URL   * @param {SidebarCollection} collection
   * @returns {string} id of found model
   */
  availableResourceId(resourceId, collection) {
    return collection.ids.includes(resourceId) ? resourceId : null;
  },

  findOutResourceId(resourceId /* , resourceType */ ) {
    return resourceId;
  },

  async scrollSidebarToActiveSidebarItem(contentModel) {
    const { resource, collection } = contentModel;
    const sidebar = globals.document.querySelector('.col-sidebar');
    let sidebarActiveItemNode = this.getActiveSidebarItemNode();

    if (
      resource.index &&
      collection.chunksArray &&
      !sidebarActiveItemNode &&
      !collection.chunksArray.map(item => item.index).includes(resource.index)
    ) {
      await collection.chunksArray.scheduleJump(resource.index, 50);
      await waitForRender();
    }

    sidebarActiveItemNode = this.getActiveSidebarItemNode();
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

  getActiveSidebarItemNode() {
    return globals.document.querySelector(
      '.col-sidebar .resource-item.active .item-header'
    );
  },

  actions: {
    error() {
      this.set('navigationState.isActiveResourceLoading', false);
      return true;
    },
  },
});
