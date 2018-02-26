/**
 * TODO: documentation
 *
 * @module routes/onedata/sidebar
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Route from '@ember/routing/route';

import { inject as service } from '@ember/service';
import { Promise } from 'rsvp';
import config from 'ember-get-config';
import isRecord from 'onedata-gui-common/utils/is-record';

const {
  onedataTabs
} = config;

function isValidTab(tabName) {
  return onedataTabs.map(({ id }) => id).indexOf(tabName) !== -1 ||
    tabName === 'users';
}

export default Route.extend({
  mainMenu: service(),
  sidebar: service(),
  sidebarResources: service(),
  navigationState: service(),

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
    if (isValidTab(type)) {
      return sidebarResources.getCollectionFor(type)
        .then(proxyCollection => {
          return isRecord(proxyCollection) || proxyCollection.list ?
            proxyCollection :
            // FIXME: simulate list records in onepanel (containers for lists)
            Promise.all(proxyCollection);
        })
        .then(collection => {
          return {
            resourceType: type,
            collection,
          };
        });
    } else {
      return Promise.reject({ error: 'invalid onedata tab name' });
    }
  },

  afterModel(model) {
    this.set('mainMenu.isLoadingItem', false);
    this.set('navigationState.activeResourceType', model.resourceType);
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
      let mainMenu = this.get('mainMenu');
      mainMenu.setProperties({
        isFailedItem: true,
        isLoadingItem: false,
      });
      return true;
    },
  }
});
