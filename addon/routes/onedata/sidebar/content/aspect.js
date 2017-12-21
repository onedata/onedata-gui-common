/**
 * A route to view or modify a specific aspect of a resource
 *
 * @module routes/onedata/sidebar/content/option
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';

const {
  inject: {
    service
  },
  Route,
} = Ember;

export default Route.extend({
  sidebar: service(),

  /**
   * @param {object} { aspectId: string } - aspectId is a name of some "aspect"
   *  of resource to present. E.g. it can be storages (aspect) list view
   *  for cluster (resource)
   * @returns {object} { resource: Model, aspectId: string }
   */
  model({ aspectId }) {
    let { resource } = this.modelFor('onedata.sidebar.content');
    return { resource, aspectId };
  },

  // TODO validate aspect of resource with afterModel
  afterModel({ aspectId }) {
    let sidebar = this.get('sidebar');
    sidebar.changeItems(1, aspectId);
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
