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

export default Service.extend({
  navigationState: service(),

  /**
   * Static definition of options that are used by main-content when displaying
   * specific aspects.
   * Maps: resource type -> aspect -> MainContentViewOptions
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
    'navigationState.{activeResourceType,activeAspect}',
    function mainContentViewOptions() {
      return this.staticViewOptions[this.navigationState.activeResourceType]
        ?.[this.navigationState.activeAspect] ?? {};
    }
  ),
});
