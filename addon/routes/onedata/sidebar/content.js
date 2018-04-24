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
import { Promise } from 'rsvp';
import { get } from '@ember/object';
import isRecord from 'onedata-gui-common/utils/is-record';

// TODO: refactor to create route-, or application-specific special ids
const SPECIAL_IDS = [
  'empty',
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

  beforeModel() {
    this.get('navigationState').setProperties({
      isActiveResourceLoading: false,
      globalSidenavResourceType: null,
    });
  },

  model({ resource_id: resourceId }) {
    // TODO: validate and use resourceType
    let {
      collection,
      resourceType
    } = this.modelFor('onedata.sidebar');
    
    if (isSpecialResourceId(resourceId)) {
      if (resourceId === 'empty' && get(collection, 'list.length')) {
        this.transitionTo('onedata.sidebar.index');
        return;
      }
      this.set('navigationState.activeResourceId', resourceId);
      return { resourceId, collection };
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
          }));
          gettingResource.catch(reject);
        });
      } else {
        return Promise.resolve({
          resourceId: null,
          resource: null,
          collection,
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
        resourceId :
        null;
    } else {
      let model = get(collection, 'list')
        .filter(model => get(model, 'id') === resourceId)[0];
      if (model) {
        modelId = get(model, 'id');
      }
    }
    return modelId;
  },
  
  actions: {
    error() {
      this.set('navigationState.isActiveResourceLoading', false);
      return true;
    },
  },
});
