/**
 * Open default content for loaded resource
 *
 * @author Jakub Liput
 * @copyright (C) 2017-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Route from '@ember/routing/route';
import _ from 'lodash';
import config from 'ember-get-config';
import { get } from '@ember/object';
import { camelize } from '@ember/string';

// TODO: copied from content route
// TODO: refactor to create route-, or application-specific special ids
const SPECIAL_IDS = [
  'empty',
  'new',
  'add',
  'join',
  'not-selected',
];

const {
  onedataTabs,
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
    const tabId = camelize(sidebarModel.resourceType);
    /** @type {object} */
    const tabModel = _.find(
      onedataTabs,
      t => get(t, 'id') === tabId
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
    const { resourceType } = this.modelFor('onedata.sidebar');
    const { resourceId } = model;
    this.render(`tabs.${resourceType}.${resourceId}`, {
      into: 'onedata.sidebar.content',
      outlet: 'main-content',
    });
  },
});
