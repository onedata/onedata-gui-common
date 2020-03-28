/**
 * Defines data available in aspect route hbs
 *
 * @module controllers/onedata/sidebar/content/aspect
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Controller from '@ember/controller';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';

export default Controller.extend({
  navigationState: service(),

  options: reads('navigationState.aspectOptionsString'),

  aspectOptions: reads('navigationState.aspectOptions'),
});
