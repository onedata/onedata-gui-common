/**
 * Open default content for loaded resource
 *
 * @author Jakub Liput
 * @copyright (C) 2017-2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Route from '@ember/routing/route';
import { camelize } from '@ember/string';
import { inject as service } from '@ember/service';

// TODO: copied from content route
// TODO: refactor to create route-, or application-specific special ids
const SPECIAL_IDS = [
  'empty',
  'new',
  'add',
  'join',
  'not-selected',
];

function isSpecialResourceId(id) {
  return SPECIAL_IDS.indexOf(id) !== -1;
}

export default Route.extend({
  navigationTabsConfiguration: service(),

  model() {
    return this.modelFor('onedata.sidebar.content');
  },

  async afterModel(model) {
    const { resourceId } = model;
    const sidebarModel = this.modelFor('onedata.sidebar');
    const tabId = camelize(sidebarModel.resourceType);
    const defaultAspect = await this.navigationTabsConfiguration.getDefaultAspect(
      tabId,
      sidebarModel,
      model
    );
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
