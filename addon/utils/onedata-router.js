/**
 * Custom Onedata router extension.
 *
 * @module utils/onedata-router
 * @author Michał Borzęcki
 * @copyright (C) 2020-2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberRouter from '@ember/routing/router';
import { inject as service } from '@ember/service';

export default EmberRouter.extend({
  router: service(),

  // Clear all query params on each transition
  // WARNING: This method belongs to a private Ember API. May change in next Ember versions
  _hydrateUnsuppliedQueryParams() {
    // FIXME: check it works in 3.8
  },
});
