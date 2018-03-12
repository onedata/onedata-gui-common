/**
 * Open default content for loaded resource
 *
 * @module routes/onedata/sidebar/content/index
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Route from '@ember/routing/route';
import _ from 'lodash';
import config from 'ember-get-config';
import { get } from '@ember/object';

// TODO: copied from content route
// TODO: refactor to create route-, or application-specific special ids
const SPECIAL_IDS = [
  'empty',
  'new',
  'join',
];

const {
  onedataTabs
} = config;

function isSpecialResourceId(id) {
  return SPECIAL_IDS.indexOf(id) !== -1;
}

export default Route.extend({
  model() {
    return this.modelFor('onedata.sidebar.content');
  },

  redirect({ resourceId }) {
    const sidebarModel = this.modelFor('onedata.sidebar');
    /** @type {object} */
    const tabModel = _.find(
      onedataTabs,
      t => get(t, 'id') === sidebarModel.resourceType
    );

    /** @type {string} */
    const defaultAspect = tabModel && tabModel.defaultAspect || 'index';

    if (!isSpecialResourceId(resourceId)) {
      this.transitionTo(
        'onedata.sidebar.content.aspect',
        defaultAspect
      );
    }
  },

  renderTemplate(controller, model) {
    let { resourceType } = this.modelFor('onedata.sidebar');
    let { resourceId } = model;
    this.render(`tabs.${resourceType}.${resourceId}`, {
      into: 'onedata.sidebar.content',
      outlet: 'main-content'
    });
  }
});
