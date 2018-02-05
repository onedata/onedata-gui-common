/**
 * A route to view or modify a specific aspect of a resource
 *
 * @module routes/onedata/sidebar/content/option
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Route from '@ember/routing/route';

import { inject as service } from '@ember/service';

export default Route.extend({
  sidebar: service(),
  navigationState: service(),

  /**
   * @param {object} { aspect_id: string } - aspect_id is a name of some "aspect"
   *  of resource to present. E.g. it can be storages (aspect) list view
   *  for cluster (resource)
   * @returns {object} { resource: Model, aspectId: string }
   */
  model({ aspect_id: aspectId }) {
    let { resource } = this.modelFor('onedata.sidebar.content');
    return { resource, aspectId };
  },

  // TODO validate aspect of resource with afterModel
  afterModel({ aspectId }) {
    let sidebar = this.get('sidebar');
    sidebar.changeItems(1, aspectId);
    this.set('navigationState.activeAspect', aspectId);
  },

  renderTemplate(controller, model) {
    let { resourceType } = this.modelFor('onedata.sidebar');
    let { aspectId } = model;
    this.render(`tabs.${resourceType}.${aspectId}`, {
      into: 'onedata.sidebar.content',
      outlet: 'main-content'
    });
  },

});
