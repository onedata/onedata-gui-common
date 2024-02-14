/**
 * Sets Ember application ref to be available for global access.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Application from '@ember/application';
import { setEmberApp } from 'onedata-gui-common/utils/ember-app';

export default {
  name: 'set-ember-app-ref',

  initialize: function (application: Application) {
    setEmberApp(application);
  },
};
