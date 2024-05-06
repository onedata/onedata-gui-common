/**
 * Silences any deprecations listed in `disabledDeprecations` and collects them
 * in a global array available under `window.ignoredEmberDeprecations`.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { registerDeprecationHandler, runInDebug } from '@ember/debug';
import globals from 'onedata-gui-common/utils/globals';

const disabledDeprecations = new Set([
  'ember-bootstrap.deprecated-argument.button#disabled',
]);

const ignoredDeprecations: Array<string> = [];

export default {
  name: 'remove-deprecations',

  initialize: () => {
    runInDebug(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (globals.window as any)['ignoredEmberDeprecations'] = ignoredDeprecations;

      registerDeprecationHandler((message, options, next) => {
        if (options && disabledDeprecations.has(options.id)) {
          ignoredDeprecations.push(message);
          return;
        }
        next(message, options);
      });
    });
  },
};
