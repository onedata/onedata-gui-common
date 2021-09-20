/**
 * Replaces router service with its extended version. It cannot be done via
 * regular service extending (in separate service file), because `RouterService`
 * is internal for Ember and cannot be imported.
 *
 * Extensions added to the RouterService:
 * - added `Evented` mixin, to be able to propagate events `routeWillChange`. This
 *   event is already available in newer Ember version and this works as a backport
 *   of that functionality. To let it work, it needs an events feed, which is placed
 *   in Utils.OnedataRouter. Both changes should be removed after upgrading Ember
 *   to version 3.6+.
 *   TODO: VFS-8267 Remove `routeWillChange` event backport.
 *
 * @module initializers/router-service
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Evented from '@ember/object/evented';

const routerFactoryName = 'service:router';

export default {
  name: 'router-service',

  initialize: function (application) {
    const EmberRouterService =
      application.resolveRegistration(routerFactoryName);
    application.unregister(routerFactoryName);
    application.register(
      routerFactoryName,
      extendEmberRouterService(EmberRouterService)
    );
  },
};

function extendEmberRouterService(EmberRouterService) {
  return EmberRouterService.extend(Evented);
}
