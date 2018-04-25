/**
 * Route for all urls, that cannot be directly mapped to main routes.
 *
 * @module routes/not-found
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Route from '@ember/routing/route';
import { inject } from '@ember/service';
import config from 'ember-get-config';

export default Route.extend({
  session: inject(),

  beforeModel() {
    const emberSimpleAuth = config['ember-simple-auth'];
    const route = this.get('session.isAuthenticated') ?
      emberSimpleAuth.routeIfAlreadyAuthenticated :
      emberSimpleAuth.authenticationRoute;
    this.transitionTo(route);
  },
});
