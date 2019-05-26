/**
 * A route to view or modify a specific aspect of a resource
 *
 * @module routes/onedata/sidebar/content/option
 * @author Jakub Liput
 * @copyright (C) 2017-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Route from '@ember/routing/route';
import { get } from '@ember/object';
import { inject as service } from '@ember/service';
import config from 'ember-get-config';
import _ from 'lodash';

const notFoundAspect = 'not-found';

const {
  onedataTabs
} = config;

export default Route.extend({
  navigationState: service(),

  queryParams: {
    options: {
      refreshModel: true
    }
  },

  beforeModel(transition) {
    this.get('navigationState').updateQueryParams(transition);
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
      const tabSettings = _.find(
        onedataTabs,
        t => get(t, 'id') === resourceType
      );
      const defaultAspect = tabSettings.defaultAspect || 'index';
      this.transitionTo('onedata.sidebar.content.aspect', defaultAspect);
    }
  },
});
