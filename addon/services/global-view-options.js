/**
 * Provides options for core views (containers) that needs to be configured when
 * displaying specific views.
 *
 * @author Jakub Liput
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service, { inject as service } from '@ember/service';
import { computed } from '@ember/object';

/**
 *
 * @typedef {'id'|SpecialResourceId} ViewOptionsResourceId
 */

export default Service.extend({
  navigationState: service(),

  /**
   * Static definition of options that are used by main-content when displaying
   * specific aspects.
   * Maps: resource type -> ViewOptionsResourceId -> aspect -> MainContentViewOptions
   * @virtual optional
   * @type {Object}
   */
  staticViewOptions: Object.freeze({}),

  /**
   * Options of main-content component.
   * @type {Object}
   */
  mainContentViewOptions: computed(
    'staticViewOptions',
    'navigationState.{activeResourceType,activeResourceId,isActiveResourceIdSpecial,activeAspect}',
    function mainContentViewOptions() {
      const resourceOptions = this.staticViewOptions[
        this.navigationState.activeResourceType
      ];
      if (!resourceOptions) {
        return {};
      }
      if (this.navigationState.isActiveResourceIdSpecial) {
        return resourceOptions?.[this.navigationState.activeResourceId] ?? {};
      } else {
        return resourceOptions?.id?.[this.navigationState.activeAspect] ?? {};
      }
    }
  ),
});
