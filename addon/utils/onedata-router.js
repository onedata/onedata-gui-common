/**
 * Custom Onedata router extension.
 *
 * Contains events feed needed to backport `routeWillChange` event functionality.
 * TODO: VFS-8267 Remove `routeWillChange` event backport on Ember upgrade.
 *
 * @module utils/onedata-router
 * @author Michał Borzęcki
 * @copyright (C) 2020-2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberRouter from '@ember/routing/router';
import { inject as service } from '@ember/service';

export default EmberRouter.extend({
  router: service('router'),

  // Clear all query params on each transition
  // WARNING: This method belongs to a private Ember API. May change in next Ember versions
  _hydrateUnsuppliedQueryParams() {},

  init() {
    this._super(...arguments);

    this.on('willTransition', (transition) => {
      const router = this.get('router');
      if (typeof router.trigger === 'function') {
        router.trigger('routeWillChange', transition);
      }
    });
  },
});
