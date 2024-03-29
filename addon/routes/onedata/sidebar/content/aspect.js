/**
 * A route to view or modify a specific aspect of a resource
 *
 * @author Jakub Liput
 * @copyright (C) 2017-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Route from '@ember/routing/route';
import { get } from '@ember/object';
import { inject as service } from '@ember/service';
import config from 'ember-get-config';
import _ from 'lodash';
import { getOwner } from '@ember/application';
import { camelize } from '@ember/string';
import findRouteInfo from 'onedata-gui-common/utils/find-route-info';

const notFoundAspect = 'not-found';

const {
  onedataTabs,
} = config;

export default Route.extend({
  navigationState: service(),

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
    if (getOwner(this).lookup(`template:${templateName}`)) {
      this.render(templateName, {
        into: 'onedata.sidebar.content',
        outlet: 'main-content',
      });
    } else {
      const tabId = camelize(resourceType);
      const tabSettings = _.find(
        onedataTabs,
        t => get(t, 'id') === tabId
      );
      const defaultAspect = tabSettings.defaultAspect || 'index';
      this.transitionTo('onedata.sidebar.content.aspect', defaultAspect);
    }
  },
});

// TODO: fix the generic not found error page
function isNotFoundError(error) {
  return get(error, 'id') === 'notFound' ||
    get(error, 'errors.firstObject.status') === '404';
}
