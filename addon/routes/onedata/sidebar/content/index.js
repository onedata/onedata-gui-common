/**
 * Open default content for loaded resource
 *
 * @author Jakub Liput
 * @copyright (C) 2017-2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Route from '@ember/routing/route';
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

  async afterModel(model, transition) {
    const { resourceId } = model;
    if (!isSpecialResourceId(resourceId)) {
      const sidebarModel = this.modelFor('onedata.sidebar');
      const isBetweenAspects =
        transition.from.name === 'onedata.sidebar.content.aspect' &&
        transition.from?.parent?.parent?.params.type ===
        transition.to?.parent?.parent?.params.type;
      let targetAspect;
      if (isBetweenAspects) {
        targetAspect = transition.from.params.aspect_id;
      } else {
        targetAspect = await this.navigationTabsConfiguration.getDefaultAspect(
          sidebarModel,
          model
        );
      }
      this.transitionTo(
        'onedata.sidebar.content.aspect',
        targetAspect
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
