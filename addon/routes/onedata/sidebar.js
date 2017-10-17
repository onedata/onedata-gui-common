/**
 * TODO: documentation
 *
 * @module routes/onedata/sidebar
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';
import config from 'ember-get-config';

const {
  inject: {
    service
  },
  RSVP: {
    Promise
  }
} = Ember;

const {
  onedataTabs
} = config;

function isValidTab(tabName) {
  return onedataTabs.map(({ id }) => id).indexOf(tabName) !== -1;
}

export default Ember.Route.extend({
  mainMenu: service(),
  sidebar: service(),
  sidebarResources: service(),

  beforeModel(transition) {
    const resourceType = transition.params['onedata.sidebar'].type;
    if (resourceType) {
      let mainMenu = this.get('mainMenu');
      mainMenu.currentItemIdChanged(resourceType);
      mainMenu.set('isLoadingItem', true);
    }
  },

  model({ type }) {
    let sidebarResources = this.get('sidebarResources');
    return new Promise((resolve, reject) => {
      if (isValidTab) {
        let gettingCollection = sidebarResources.getCollectionFor(type);
        gettingCollection
          .then(proxyCollection => {
            return Promise.all(proxyCollection);
          })
          .then(collection => {
            resolve({
              resourceType: type,
              collection
            });
          })
          .catch(reject);
        gettingCollection.catch(reject);
      } else {
        reject({ error: 'invalid onedata tab name' });
      }
    });
  },

  afterModel() {
    let mainMenu = this.get('mainMenu');
    mainMenu.set('isLoadingItem', false);
  },

  renderTemplate(controller, model) {
    let {
      resourceType
    } = model;
    this.render('onedata.sidebar', {
      into: 'onedata',
      outlet: 'sidebar'
    });
    this.render(`tabs.${resourceType}.sidebar`, {
      into: 'onedata.sidebar',
      outlet: 'sidebar-content',
      model
    });
  },

  actions: {
    error() {
      this._super(...arguments);
      let mainMenu = this.get('mainMenu');
      mainMenu.setProperties({
        isFailedItem: true,
        isLoadingItem: false,
      });
    },
  }
});
