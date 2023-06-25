/**
 * Adds support for graphical reconnector for onedata-websocket-error-handler service.
 *
 * @author Jakub Liput
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Mixin from '@ember/object/mixin';
import { inject as service } from '@ember/service';
import { ReconnectorState } from 'onedata-gui-common/services/onedata-websocket-error-handler';
import { gt } from 'ember-awesome-macros';

/**
 * WebSocket close event code: GOING_AWAY
 *
 * The endpoint is going away, either because of a server failure
 * or because the browser is navigating away from the page that opened the connection.
 *
 * https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent
 */
const GOING_AWAY = 1001;

export default Mixin.create({
  session: service(),

  /**
   * Global state accessible by reconnector.
   * Set in init.
   * @type {ReconnectorState}
   */
  reconnectorState: undefined,

  /**
   * Global variable accessible by reconnection modal: was WebSocket opened
   * before close?
   * Set in init.
   * @type {boolean}
   */
  currentOpeningCompleted: undefined,

  isConnectionProblem: gt('reconnectorState', ReconnectorState.closed),

  init() {
    this._super(...arguments);
    this.resetReconnectorState();
  },

  /**
   * @override
   * @param {CloseEvent} closeEvent
   * @param {boolean} openingCompleted
   */
  abnormalClose(closeEvent, openingCompleted) {
    console.warn(
      `websocket abnormalClose: WS close not invoked by user, code: ${closeEvent.code}, WS was ${openingCompleted ? 'opened' : 'NOT opened'}`
    );
    if (closeEvent?.code === GOING_AWAY) {
      console.debug(
        'websocket abnormalClose: GOING_AWAY code, ignoring'
      );
    } else {
      if (this.reconnectorState === ReconnectorState.closed) {
        this.setProperties({
          reconnectorState: ReconnectorState.init,
          currentOpeningCompleted: openingCompleted,
        });
      }
    }
  },

  /**
   * Invoked when WebSocket `onerror` occures.
   * @override
   * @param {any} errorEvent
   * @param {boolean} openingCompleted
   */
  errorOccured(errorEvent, openingCompleted) {
    console.warn(
      `websocket error: WS was ${openingCompleted ? 'opened' : 'NOT opened'}`
    );
    if (this.reconnectorState === ReconnectorState.closed) {
      this.setProperties({
        reconnectorState: ReconnectorState.init,
        currentOpeningCompleted: openingCompleted,
      });
    }
  },

  /**
   * @override
   */
  async reconnect() {
    const isAuthenticated = this.session?.isAuthenticated;
    await this.forceCloseConnection();
    await this.initWebSocketConnection(isAuthenticated ? 'authenticated' : 'anonymous');
  },

  resetReconnectorState() {
    this.setProperties({
      reconnectorState: ReconnectorState.closed,
      currentOpeningCompleted: null,
    });
  },
});
