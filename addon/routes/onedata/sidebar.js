/**
 * TODO: documentation
 *
 * @module routes/onedata/sidebar
 * @author Jakub Liput, Michal Borzecki
 * @copyright (C) 2017-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { get } from '@ember/object';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import config from 'ember-get-config';
import { scheduleOnce } from '@ember/runloop';
import { camelize } from '@ember/string';

const {
  onedataTabs,
} = config;

function isValidTab(tabName) {
  return Boolean(onedataTabs.findBy('id', camelize(tabName))) ||
    tabName === 'users';
}

export default Route.extend({
  sidebarResources: service(),
  navigationState: service(),

  beforeModel(transition) {
    const resourceType = transition.params['onedata.sidebar'].type;
    if (!isValidTab(resourceType)) {
      console.warn(
        `Failed to render ${resourceType} resource type. ` +
        'Redirecting to default resource type...'
      );
      this.transitionTo('onedata.sidebar', this.getDefaultTab());
      return;
    } else {
      this.get('navigationState').setProperties({
        isActiveResourceCollectionLoading: true,
        hasActiveResourceCollectionLoadingFailed: false,
        activeResourceCollection: undefined,
        activeResourceId: undefined,
      });
    }
  },

  model({ type }) {
    return this.get('sidebarResources').getSidebarModelFor(type);
  },

  afterModel(model) {
    this.get('navigationState').setProperties({
      activeResourceType: model.resourceType,
      activeResourceCollection: model.collection,
      isActiveResourceCollectionLoading: false,
    });
  },

  renderTemplate(controller, model) {
    const sidebarComponentName = this.get('sidebarResources')
      .getSidebarComponentNameFor(get(model, 'resourceType'));

    this.render('onedata.sidebar', {
      into: 'onedata',
      outlet: 'sidebar',
      model: Object.assign({}, model, { sidebarComponentName }),
    });
    scheduleOnce('afterRender', this, 'scrollSidebarToTop');
  },

  scrollSidebarToTop() {
    const sidebar = document.querySelector('.col-sidebar');
    if (sidebar) {
      sidebar.scrollTop = 0;
    }
  },

  /**
   * Returns default application tab, that can be used as a fallback when
   * user does not provide any
   * @returns {string}
   */
  getDefaultTab() {
    return (onedataTabs[0] || {}).id;
  },

  actions: {
    error() {
      this.get('navigationState').setProperties({
        hasActiveResourceCollectionLoadingFailed: true,
        isActiveResourceCollectionLoading: false,
      });
      return true;
    },
  },
});
