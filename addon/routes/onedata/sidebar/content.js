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
 * @copyright (C) 2017-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Route from '@ember/routing/route';

import { inject as service } from '@ember/service';
import { Promise, resolve } from 'rsvp';
import { get, setProperties } from '@ember/object';
import isRecord from 'onedata-gui-common/utils/is-record';
import gri from 'onedata-gui-websocket-client/utils/gri';
import { underscore } from '@ember/string';

// TODO: refactor to create route-, or application-specific special ids
const SPECIAL_IDS = [
  'empty',
  'add',
  'new',
  'join',
  'not-selected',
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
    let {
      collection,
      resourceType
    } = this.modelFor('onedata.sidebar');

    const navigationState = this.get('navigationState');
    const queryParams = get(transition, 'queryParams');

    if (isSpecialResourceId(resourceId)) {
      setProperties(navigationState, {
        isActiveResourceIdSpecial: true,
        activeResourceId: resourceId,
      });
      if (resourceId === 'empty' && get(collection, 'list.length')) {
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
          let gettingResource = this.get('contentResources')
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
        const presumableGri = this.findOutGri(resourceId, resourceType);
        return (presumableGri ?
            this.get('contentResources').getModelFor(resourceType, presumableGri) :
            resolve(null)
          )
          .then(record => {
            // this is resource that shouldn't be fetched,
            // because we do not have it on a list anyway
            return { record };
          })
          .catch(error => ({ error }))
          .then(({ error }) => {
            return Promise.resolve({
              resourceId: null,
              resource: null,
              collection,
              queryParams,
              error,
            });
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
      outlet: 'content'
    });
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

  findOutGri(resourceId, resourceType) {
    const entityType = underscore(resourceType).replace(/s$/, '');
    if (entityType) {
      return gri({
        entityId: resourceId,
        entityType,
        aspect: 'instance',
        scope: 'protected',
      });
    } else {
      return null;
    }

  },

  actions: {
    error() {
      this.set('navigationState.isActiveResourceLoading', false);
      return true;
    },
  },
});
