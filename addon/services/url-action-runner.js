/**
 * A base implementation of an action runner, which is fed using data from routing-related
 * objects. It has no action runners defined. To be fully functional, it needs to be
 * extended in main projects to introduce some runners implementations (e.g. by registering
 * them in `init` method).
 *
 * @module services/url-action-runner
 * @author Michał Borzęcki
 * @copyright (C) 2020-2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service, { inject as service } from '@ember/service';
import { get } from '@ember/object';
import { resolve } from 'rsvp';

export default Service.extend({
  router: service(),

  /**
   * @type {Map<String,Function>}
   */
  actionsRunners: undefined,

  init() {
    this._super(...arguments);

    this.set('actionRunners', new Map());
  },

  /**
   * Adds new action runner. Only one runner can be registered for a specific action
   * @param {String} actionName
   * @param {Function} actionRunner
   */
  registerActionRunner(actionName, actionRunner) {
    this.get('actionRunners').set(actionName, actionRunner || resolve);
  },

  /**
   * Removes registered action runner. If there was no runner, nothing happens.
   * @param {String} actionName
   */
  deregisterActionRunner(actionName) {
    this.get('actionRunners').delete(actionName);
  },

  /**
   * Returns registered action runner. If there is no runner registered for specified action,
   * then `undefined` is returned.
   * @param {String} actionName
   * @returns {Function|undefined}
   */
  getActionRunner(actionName) {
    return this.get('actionRunners').get(actionName);
  },

  /**
   * Runs an action according to the action name and params passed using transition object
   * (via queryParams). It should be called in top-most routes to avoid duplicated execution.
   * @param {Transition} transition
   * @returns {Promise<Utils.ActionResult>}
   */
  runFromTransition(transition) {
    const queryParams = transition?.to.queryParams ?? {};
    const actionName = get(queryParams, 'action_name');
    if (!actionName) {
      return resolve();
    }

    const actionRunner = this.getActionRunner(actionName);
    const actionResult = (typeof actionRunner === 'function') ?
      actionRunner(queryParams, transition) : resolve();
    return actionResult && actionResult.then ? actionResult : resolve(actionResult);
  },

  /**
   * @param {Transition} transition
   */
  clearActionQueryParams(transition) {
    const queryParams = transition.to.queryParams;
    const queryParamsNames = Object.keys(queryParams);
    if (queryParamsNames.find(name => name.startsWith('action_'))) {
      const queryParamsWithoutAction = Object.keys(queryParams)
        .reduce((params, key) => {
          params[key] = key.startsWith('action_') ?
            undefined : queryParams[key];
          return params;
        }, {});
      this.router.transitionTo({ queryParams: queryParamsWithoutAction });
    }
  },
});
