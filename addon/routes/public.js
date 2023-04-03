/**
 * This route is an access point to all publicly exposed resources
 *
 * @author Michał Borzęcki
 * @copyright (C) 2019-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  currentUser: service(),

  model() {
    const isUserSignedIn = Boolean(this.get('currentUser.userId'));
    return { isUserSignedIn };
  },
});
