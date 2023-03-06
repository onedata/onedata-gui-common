/**
 * Adds aliases for handling `options` query param.
 *
 * IMPORTANT: you must add `queryParams: ['options']` to controller manually,
 * because not every use-case allows to add `queryParam` using this controller.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Mixin from '@ember/object/mixin';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';

export default Mixin.create({
  navigationState: service(),

  options: alias('navigationState.aspectOptionsString'),

  aspectOptions: alias('navigationState.aspectOptions'),
});
