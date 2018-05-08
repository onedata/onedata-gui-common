/**
 * A route to view or modify a specific aspect of a resource
 *
 * @module routes/onedata/sidebar/content/option
 * @author Jakub Liput
 * @copyright (C) 2017-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

const notFoundAspect = 'not-found';

export default Route.extend({
  navigationState: service(),

  beforeModel(transition) {
    const contentModel = this.modelFor('onedata.sidebar.content');
    const aspect = transition.params['onedata.sidebar.content.aspect'].aspect_id;
    if (!contentModel.resource) {
      this.transitionTo('onedata.sidebar.content.aspect', 'not-found');
    } else if (aspect === notFoundAspect) {
      this.transitionTo('onedata.sidebar.content.aspect', 'index');
    }
  },

  /**
   * @param {object} { aspect_id: string } - aspect_id is a name of some "aspect"
   *  of resource to present. E.g. it can be storages (aspect) list view
   *  for cluster (resource)
   * @returns {object} { resource: Model, aspectId: string }
   */
  model({ aspect_id: aspectId }) {
    const contentModel = this.modelFor('onedata.sidebar.content');
    return Object.assign({ aspectId }, contentModel);
  },

  // TODO validate aspect of resource with afterModel
  afterModel({ aspectId }) {
    this.set('navigationState.activeAspect', aspectId);
  },

  renderTemplate(controller, model) {
    const { resourceType } = this.modelFor('onedata.sidebar');
    const { aspectId } = model;
    const templateName = model.aspectId === notFoundAspect ?
      '-resource-not-found' :
      `tabs.${resourceType}.${aspectId}`;
    try {
      this.render(templateName, {
        into: 'onedata.sidebar.content',
        outlet: 'main-content'
      });
    } catch (error) {
      console.warn(`Failed to render ${aspectId} aspect template: ${templateName}`);
      console.warn(error);
      this.transitionTo('onedata.sidebar.content.aspect', 'index');
    }
  },
});
