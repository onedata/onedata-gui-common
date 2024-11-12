/**
 * A route to view or modify a specific aspect of a resource
 *
 * @author Jakub Liput
 * @copyright (C) 2017-2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Route from '@ember/routing/route';
import { get } from '@ember/object';
import { inject as service } from '@ember/service';
import { getOwner } from '@ember/application';
import findRouteInfo from 'onedata-gui-common/utils/find-route-info';

const notFoundAspect = 'not-found';

export default Route.extend({
  navigationState: service(),
  navigationTabsConfiguration: service(),

  /**
   * @override
   */
  beforeModel(transition) {
    this.get('navigationState').updateQueryParams(transition);
    const contentModel = this.modelFor('onedata.sidebar.content');
    const aspect = findRouteInfo(transition, 'onedata.sidebar.content.aspect')
      .params['aspect_id'];
    const resourceType = this.modelFor('onedata.sidebar').resourceType;
    if (!contentModel.resource) {
      if (contentModel.error && !isNotFoundError(contentModel.error)) {
        if (contentModel.error.id === 'forbidden') {
          throw {
            isOnedataCustomError: true,
            type: resourceType === 'clusters' ?
              'no-cluster-permissions' : 'no-permissions',
          };
        } else {
          throw contentModel.error;
        }
      } else {
        this.transitionTo('onedata.sidebar.content.aspect', 'not-found');
      }
    } else if (aspect === notFoundAspect) {
      this.transitionTo('onedata.sidebar.content.aspect', 'index');
    }
  },

  /**
   * @override
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
  /**
   * @override
   */
  async afterModel(model) {
    const sidebarModel = this.modelFor('onedata.sidebar');
    const { resourceType } = sidebarModel;
    const { aspectId } = model;
    this.set('navigationState.activeAspect', aspectId);
    const templateName = this.getTemplateName(resourceType, aspectId);
    if (!getOwner(this).lookup(`template:${templateName}`)) {
      const defaultAspect = await this.navigationTabsConfiguration.getDefaultAspect(
        sidebarModel,
        model
      );
      this.transitionTo('onedata.sidebar.content.aspect', defaultAspect);
    }
  },

  /**
   * @override
   */
  renderTemplate(controller, model) {
    const { resourceType } = this.modelFor('onedata.sidebar');
    const { aspectId } = model;
    const templateName = this.getTemplateName(resourceType, aspectId);
    this.render(templateName, {
      into: 'onedata.sidebar.content',
      outlet: 'main-content',
    });
  },

  /**
   * @override
   */
  deactivate() {
    const sidebarModel = this.modelFor('onedata.sidebar');
    const contentModel = this.modelFor('onedata.sidebar.content');
    // Remember last used resource in the current web browser tab. It is useful when user
    // has multiple web browser tabs opened, and different resources of the same types
    // (eg. spaces), and navigates between resources and clusters. The similiar mechanism
    // of storing last used resource in session is described in
    // src/lib/onedata-gui-common/addon/services/navigation-tabs-configuration.js.
    this.navigationTabsConfiguration.setLocalLastUsedResource(sidebarModel, contentModel);
  },

  getTemplateName(resourceType, aspectId) {
    return aspectId === notFoundAspect ?
      '-resource-not-found' :
      `tabs.${resourceType}.${aspectId}`;
  },
});

// TODO: fix the generic not found error page
function isNotFoundError(error) {
  return get(error, 'id') === 'notFound' ||
    get(error, 'errors.firstObject.status') === '404';
}
