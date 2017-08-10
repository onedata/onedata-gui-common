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

import Ember from 'ember';

const {
  inject: {
    service
  },
  RSVP: {
    Promise
  },
} = Ember;

const SPECIAL_IDS = [
  'empty',
  'new',
];

function isSpecialResourceId(id) {
  return SPECIAL_IDS.indexOf(id) !== -1;
}

export default Ember.Route.extend({
  sidebar: service(),
  eventsBus: service(),
  contentResources: service(),

  model({ resourceId }) {
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

  afterModel({ resourceId }) {
    let sidebar = this.get('sidebar');
    // TODO only if this is content with sidebar with item
    sidebar.changeItems(0, resourceId);
    // TODO get properties
    // TODO transition promise wait before hide sidenav
    this.get('eventsBus').trigger('one-sidenav:close', '#sidenav-sidebar');
  },

  renderTemplate() {
    // render generic content template
    this.render('onedata.sidebar.content', {
      into: 'onedata',
      outlet: 'content'
    });
  },
});
