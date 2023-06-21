/**
 * Modal that controls and shows status of WebSocket reconnection attempts
 *
 * @author Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { ReconnectorState } from 'onedata-gui-common/services/onedata-websocket-error-handler';
import { inject as service } from '@ember/service';
import { reads, gt } from '@ember/object/computed';
import { computed, observer } from '@ember/object';
import { Promise } from 'rsvp';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { later } from '@ember/runloop';
import globals from 'onedata-gui-common/utils/globals';
import browser, { BrowserName } from 'onedata-gui-common/utils/browser';
import layout from 'onedata-gui-common/templates/components/websocket-reconnection-modal';

export const sessionExpiredCookie = 'sessionExpired';

/**
 * Maps: state number => state name (eg. 2 => connecting) of ReconnectorState
 */
const stateNames = Object.keys(ReconnectorState).reduce((prev, key) => {
  prev[ReconnectorState[key]] = key;
  return prev;
}, {});

export default Component.extend(I18n, {
  layout,

  onedataWebsocketErrorHandler: service(),
  globalNotify: service(),
  session: service(),
  cookies: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.websocketReconnectionModal',

  /**
   * Number of automatic (scheduled) reconnect attempt; reset on modal show.
   * @type {Number}
   */
  currentAttempt: 0,

  /**
   * Max number of automatic reconnect attempts, after which reconnection
   * will be invoked only with button.
   * @type {Number}
   */
  maxAttempts: 10,

  /**
   * How many seconds longer each attempt should wait relative to previous.
   * @type {Number}
   */
  secondsIncrement: 5,

  /**
   * Current state of seconds counter.
   * @type {Number}
   */
  secondsRemaining: 0,

  /**
   * Id of `setInterval` loop for connection attempts
   * @type {Number|null}
   */
  attemptInterval: null,

  /**
   * Flag that is set to true when modal is fully visible and after animation
   * @type {boolean}
   */
  isModalShown: false,

  /**
   * Transition duration for modal (see bs-modal docs)
   * @type {Number}
   */
  modalTransitionDuration: 300,

  /**
   * @type {number}
   */
  reconnectorState: reads('onedataWebsocketErrorHandler.reconnectorState'),

  /**
   * @type {boolean}
   */
  currentOpeningCompleted: reads(
    'onedataWebsocketErrorHandler.currentOpeningCompleted'
  ),

  /**
   * @type {boolean}
   */
  opened: gt('reconnectorState', ReconnectorState.init),

  /**
   * Name of ReconnectorState, eg. closed, init, waiting, connecting, timeout,
   * error.
   * @type {string}
   */
  state: computed('reconnectorState', function state() {
    return stateNames[this.get('reconnectorState')];
  }),

  /**
   * Key of translation for additional info about error that can be found in:
   * `components.websocketReconnectionModal.specialText`.
   * @type {ComputedProperty<string|undefined>}
   */
  specialText: computed(
    'currentOpeningCompleted',
    function specialText() {
      const isSafari = browser.name === BrowserName.Safari;
      const isAuthenticated = this.get('session.isAuthenticated');
      if (isSafari && !isAuthenticated && !this.get('currentOpeningCompleted')) {
        return 'safariCert';
      }
    }
  ),

  /**
   * Starts reconnection procedure when external `reconnectorState` changes
   */
  watchReconnectorState: observer('reconnectorState', function watchReconnectorState() {
    switch (this.get('reconnectorState')) {
      case ReconnectorState.init:
        this.onReconnectorInit();
        break;
      case ReconnectorState.closed:
        this.onReconnectorClose();
        break;
      default:
        break;
    }
  }),

  init() {
    this._super(...arguments);
    // activate observers
    this.get('reconnectorState');
  },

  startNextAttempt() {
    clearInterval(this.get('attemptInterval'));
    this.set('attemptInterval', null);
    this.incrementProperty('currentAttempt');
    return this.reconnectAttempt();
  },

  manualAttempt() {
    return this.reconnectAttempt();
  },

  reconnectSuccess() {
    this.close();
    this.get('globalNotify').success(this.t('connectedSuccessfully'));
  },

  /**
   * Use this method to cause modal to open, reset counters and start
   * reconnection procedure.
   * @returns {Promise} startNextAttempt promise
   */
  onReconnectorInit() {
    safeExec(this, 'setProperties', {
      currentAttempt: 0,
      secondsRemaining: 0,
    });
    return this.startNextAttempt();
  },

  onReconnectorClose() {
    const attemptInterval = this.get('attemptInterval');
    if (attemptInterval) {
      clearInterval(attemptInterval);
      this.set(attemptInterval, null);
    }
  },

  /**
   * Use this method to change global state and close the modal.
   * Respects modal animation time.
   * @returns {Promise} resolves after state is changed to closed
   */
  close() {
    const isModalShown = this.get('isModalShown');
    const modalTransitionDuration = this.get('modalTransitionDuration');
    return new Promise((resolve, reject) => {
      later(() => {
        try {
          this.onedataWebsocketErrorHandler.resetReconnectorState();
          resolve();
        } catch (error) {
          reject(error);
        }
      }, isModalShown ? 0 : modalTransitionDuration);
    });
  },

  /**
   * Hook invoked when reconnection fails.
   * @param {any} error
   * @returns {undefined}
   */
  reconnectFailure(error) {
    this.globalNotify.warning(this.t('connectionFailed'));

    if (isInvalidSessionError(error)) {
      this.handleInvalidSessionReconnectFailure(error);
    } else {
      this.handleCommonReconnectFailure(error);
    }
  },

  handleCommonReconnectFailure( /* error */ ) {
    const {
      currentAttempt,
      maxAttempts,
    } = this.getProperties('currentAttempt', 'maxAttempts');

    if (currentAttempt >= maxAttempts) {
      this.set('currentAttempt', maxAttempts);
      this.setReconnectorState(ReconnectorState.timeout);
    } else {
      this.setReconnectorState(ReconnectorState.waiting);
      this.scheduleNextAttempt();
    }
  },

  handleInvalidSessionReconnectFailure() {
    const {
      session,
      cookies,
    } = this.getProperties('session', 'cookies');
    // must use cookies, because after invalidation,
    // the app is reloaded by ember-simple-auth
    cookies.write(sessionExpiredCookie, '1', { path: '/' });
    return session.invalidate();
  },

  /**
   * Schedule next waiting time for reconnection attempt.
   * @returns {undefined}
   */
  scheduleNextAttempt() {
    const currentAttempt = this.get('currentAttempt');
    const attemptSeconds = this.get('secondsIncrement') * currentAttempt;
    this.set('secondsRemaining', attemptSeconds);
    const attemptInterval = setInterval(() => {
      const secondsRemainig = this.get('secondsRemaining');
      if (secondsRemainig <= 1) {
        this.startNextAttempt();
      } else {
        this.decrementProperty('secondsRemaining');
      }
    }, 1000);
    this.set('attemptInterval', attemptInterval);
  },

  /**
   * Set global reconnector state.
   * @param {Number} reconnectorState
   * @returns {Number} the set state
   */
  setReconnectorState(reconnectorState) {
    return safeExec(
      this,
      'set',
      'onedataWebsocketErrorHandler.reconnectorState',
      reconnectorState
    );
  },

  /**
   * Start reconnection procedure
   * @returns {Promise} resolves when reconnected successfully
   */
  async reconnectAttempt() {
    this.setReconnectorState(ReconnectorState.connecting);
    try {
      await this.onedataWebsocketErrorHandler.reconnect();
      this.reconnectSuccess();
    } catch (error) {
      this.reconnectFailure(error);
      throw error;
    }
  },

  actions: {
    connectNow() {
      if (this.get('reconnectorState') === ReconnectorState.timeout) {
        return this.manualAttempt();
      } else {
        return this.startNextAttempt();
      }
    },
    reload() {
      return new Promise(() => {
        globals.location.reload();
      });
    },
    modalShown() {
      safeExec(this, 'set', 'isModalShown', true);
    },
    modalHidden() {
      safeExec(this, 'set', 'isModalShown', false);
    },
  },
});

export function isInvalidSessionError(error) {
  return error && error.isOnedataCustomError &&
    error.type === 'fetch-token-error' && error.reason === 'unauthorized';
}
