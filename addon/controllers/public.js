/**
 * Adds pointer-events-related property to template
 *
 * @module controllers/public
 * @author Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { conditional, raw } from 'ember-awesome-macros';

export default Controller.extend({
  pointerEvents: service(),

  publicRouteElementClass: conditional(
    'pointerEvents.pointerNoneToMainContent',
    raw('no-pointer-events'),
    raw(''),
  ),
});
