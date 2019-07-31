/**
 * Uses Onedata config read in `fetch-gui-context` initializer to silent `console.debug` messages.
 * Requires `fetch-gui-context` initializer!
 * Note, that this blocks application initialization until config is resolved/rejected.
 * In case of errors, configure with blank config, which should lead to disable debug logs.
 * This is done because if attacked could make configuration unavailabe, the logs should not be visible.
 * 
 * @module initializers/configure-console
 * @author Jakub Liput
 * @copyright (C) 2016-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

function configure(config) {
  if (!config.browserDebugLogs) {
    console._debug = console.debug;
    console.debug = function () {};
  } else {
    console.debug('Debug messages in console enabled');
  }
}

export function initialize(application) {
  if (application.guiContextProxy) {
    application.guiContextProxy
      .then(guiContext => {
        configure(guiContext);
      });
  } else {
    console.error(
      'No Ember.application.guiContextProxy available - was fetch-gui-context initializer invoked?'
    );
    configure({});
  }
}

export default {
  name: 'configure-console',
  initialize: initialize,
  after: 'fetch-gui-context'
};
