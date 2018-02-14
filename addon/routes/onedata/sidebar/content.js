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
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Route from '@ember/routing/route';

import { inject as service } from '@ember/service';
import { Promise } from 'rsvp';

const SPECIAL_IDS = [
  'empty',
  'new',
];

function isSpecialResourceId(id) {
  return SPECIAL_IDS.indexOf(id) !== -1;
}

export default Route.extend({
  sidebar: service(),
  eventsBus: service(),
  contentResources: service(),

  beforeModel(transition) {
    const resourceId = transition.params['onedata.sidebar.content'].resource_id;
    const {
      sidebar,
      eventsBus,
    } = this.getProperties('sidebar', 'eventsBus');
    sidebar.changeItems(0, resourceId);
    sidebar.set('isLoadingItem', true);
    eventsBus.trigger('one-sidenav:close', '#sidenav-sidebar');
  },

  model({ resource_id: resourceId }) {
    // TODO: validate and use resourceType
    let {
      resourceType
    } = this.modelFor('onedata.sidebar');

    if (isSpecialResourceId(resourceId)) {
      return { resourceId };
    } else {
      return new Promise((resolve, reject) => {
        let gettingResource = this.get('contentResources')
          .getModelFor(resourceType, resourceId);
        gettingResource.then(resource => resolve({
          resourceId,
          resource,
        }));
        gettingResource.catch(reject);
      });
    }
  },

  afterModel() {
    let sidebar = this.get('sidebar');
    sidebar.set('isLoadingItem', false);
  },

  renderTemplate() {
    // render generic content template
    this.render('onedata.sidebar.content', {
      into: 'onedata',
      outlet: 'content'
    });
  },

  actions: {
    error() {
      let sidebar = this.get('sidebar');
      sidebar.set('isLoadingItem', false);
      return true;
    },
  },
});
