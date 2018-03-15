/**
 * TODO: documentation
 *
 * @module routes/onedata/sidebar
 * @author Jakub Liput, Michal Borzecki
 * @copyright (C) 2017-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Route from '@ember/routing/route';
import EmberObject, { get } from '@ember/object';
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
  sidebarResources: service(),
  navigationState: service(),

  beforeModel(transition) {
    const resourceType = transition.params['onedata.sidebar'].type;
    if (resourceType) {
      this.get('navigationState').setProperties({
        isActiveResourceCollectionLoading: true,
        hasActiveResourceCollectionLoadingFailed: false,
        activeResourceCollection: undefined,
      });
    }
  },

  model({ type }) {
    if (isValidTab(type)) {
      return this.get('sidebarResources').getCollectionFor(type)
        .then(proxyCollection => {
          return isRecord(proxyCollection) || get(proxyCollection, 'list') ?
            proxyCollection :
            Promise.all(proxyCollection).then(list => EmberObject.create({ list }));
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
    this.get('navigationState').setProperties({
      activeResourceType: model.resourceType,
      activeResourceCollection: model.collection,
      isActiveResourceCollectionLoading: false,
    });
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
      this.get('navigationState').setProperties({
        hasActiveResourceCollectionLoadingFailed: true,
        isActiveResourceCollectionLoading: false,
      });
      return true;
    },
  } 
});
