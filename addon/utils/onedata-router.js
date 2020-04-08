/**
 * Custom Onedata router extension.
 * 
 * @module utils/onedata-router
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberRouter from '@ember/routing/router';

export default EmberRouter.extend({
  // Clear all query params on each transition
  // WARNING: This method belongs to a private Ember API. May change in next Ember versions
  _hydrateUnsuppliedQueryParams() {},
});
