/**
 * A virtual service to make an interface for components using websocket global state.
 * You should use service `onedata-websocket-error-handler` (generic, non-GUI
 * implementation) from `onedata-gui-websocket-client` addon as service base with
 * `reconnecting-websocket-error-handler` mixin, which adds support for GUI.
 *
 * @author Jakub Liput
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service from '@ember/service';

/**
 * @typedef {0|1|2|3|4|5} ReconnectorState
 * State number that describes what is going on with reconnecting modal.
 * - 0: closed
 * - 1: init
 * - 2: connecting
 * - 3: waiting
 * - 4: timeout
 * - 5: error
 */

export const ReconnectorState = Object.freeze({
  closed: 0,
  init: 1,
  connecting: 2,
  waiting: 3,
  timeout: 4,
  error: 5,
});

export default Service.extend({
  /**
   * @virtual
   * @type {number}
   */
  reconnectorState: undefined,

  /**
   * @virtual
   * @type {boolean}
   */
  currentOpeningCompleted: undefined,

  /**
   * This function should set state of websocket reconnector to initial.
   * It should be invoked on init and when connection is restored.
   * @virtual
   * @type {() => void}
   */
  resetReconnectorState: undefined,
});
