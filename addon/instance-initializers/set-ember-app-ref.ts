/**
 * Sets Ember application ref to be available for global access.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import ApplicationInstance from '@ember/application/instance';
import { setEmberApp } from 'onedata-gui-common/utils/ember-app';
import globals from 'onedata-gui-common/utils/globals';

export default {
  name: 'set-ember-app-ref',

  initialize: function (application: ApplicationInstance) {
    setEmberApp(application);

    // Casting to any to assign custom property to window object.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globals.window as any).emberApp = application;
  },
};
