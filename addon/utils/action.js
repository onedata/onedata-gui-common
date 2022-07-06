/**
 * An abstract base class for all actions. To execute concrete action, simply call
 * execute(). Execution flow on execute() call:
 * 1. onExecute() - if does not return ActionResult or promise with ActionResult, then
 *    result is converted to ActionResult automatically.
 * 2. executeHooks - hooks are called one after another, in the same order as were added,
 *    regardless result status obtained from onExecute (which means that each hook must
 *    control ActionResult status by itself). If some of the hooks fail (rejects, throws
 *    error), then the following rest of the hooks WONT BE called. Results from the hooks
 *    are ignored except errors - these will replace origin ActionResult with the new one
 *    representing the hook error.
 * 3. notifyResult() - notifies user using data from ActionResult. Notification can be
 *    changed/cancelled by simple overriding that method.
 *
 * @module utils/action
 * @author Michał Borzęcki
 * @copyright (C) 2019-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject, { computed, get } from '@ember/object';
import { reads } from '@ember/object/computed';
import notImplementedThrow from 'onedata-gui-common/utils/not-implemented-throw';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import OwnerInjector from 'onedata-gui-common/mixins/owner-injector';
import { resolve } from 'rsvp';
import ActionResult from 'onedata-gui-common/utils/action-result';

export default EmberObject.extend(I18n, OwnerInjector, {
  i18n: service(),
  globalNotify: service(),

  /**
   * @virtual
   * @type {Function}
   * @returns {Promise<Utils.ActionResult>}
   * Performs action
   */
  onExecute: notImplementedThrow,

  /**
   * @virtual optional
   * @type {string}
   */
  icon: undefined,

  /**
   * @virtual optional
   * @type {string}
   */
  tip: undefined,

  /**
   * @virtual optional
   * @type {string}
   */
  className: undefined,

  /**
   * @virtual optional
   * @type {boolean}
   */
  disabled: false,

  /**
   * @virtual optional
   * @type {any}
   * Action context. Can be used as a data source for execute().
   */
  context: null,

  /**
   * @virtual optional
   * @type {ComputedProperty<String>}
   */
  title: computed('i18nPrefix', function title() {
    return this.t('title', {}, { defaultValue: '' });
  }),

  /**
   * Will be called just after the onExecute() method. Are executed in order and if some
   * of them fails, then the following rest is not called. Errors change action result.
   * @type {ComputedProperty<Array<Function>>}
   */
  executeHooks: computed(() => []),

  /**
   * @type {Ember.ComputedProperty<Function>}
   * Callback ready to use inside hbs action helper
   */
  executeCallback: computed(function executeCallback() {
    return () => this.execute();
  }),

  /**
   * @type {Ember.ComputedProperty<Function>}
   * An alias to `executeCallback` to preserve compatibility with old usages of
   * action object. Maybe to remove in future.
   */
  action: reads('executeCallback'),

  /**
   * Executes action (onExecute and then execute hooks)
   * @returns {Promise<Utils.ActionResult>}
   */
  execute() {
    const {
      disabled,
      executeHooks,
    } = this.getProperties('disabled', 'executeHooks');

    if (disabled) {
      return;
    }

    return resolve(this.onExecute())
      .then(result => (!result || !result.interceptPromise) ? ActionResult.create({
        status: 'done',
        result,
      }) : result)
      .catch(result => (!result || !result.interceptPromise) ? ActionResult.create({
        status: 'failed',
        error: result,
      }) : result)
      .then(result => {
        const executeHooksPromise = (executeHooks || []).reduce(
          (hooksPromise, hook) => hooksPromise.then(() => hook(result, this)),
          resolve()
        );

        return executeHooksPromise
          .then(() => result)
          .catch(error => ActionResult.create({
            status: 'failed',
            error,
          }))
          .then(result => {
            this.notifyResult(result);
            return result;
          });
      });
  },

  /**
   * Adds new execute hook at the end of the hooks list
   * @param {Function} hookCallback
   */
  addExecuteHook(hookCallback) {
    this.get('executeHooks').push(hookCallback);
  },

  /**
   * Removes registered execute hook
   * @param {Function} hookCallback
   */
  removeExecuteHook(hookCallback) {
    this.set('executeHooks', this.get('executeHooks').without(hookCallback));
  },

  /**
   * Returns text used to notify action success (passed to global-notify).
   * @param {Utils.ActionResult} [actionResult]
   * @returns {HtmlSafe}
   */
  getSuccessNotificationText(actionResult) {
    const result = get(actionResult || {}, 'result');
    const placeholders = typeof result === 'object' && result ? result : {};
    return this.t('successNotificationText', placeholders, {
      defaultValue: '',
    });
  },

  /**
   * Returns action name used notify action failure (passed to global-notify).
   * @param {Utils.ActionResult} [actionResult]
   * @returns {HtmlSafe}
   */
  getFailureNotificationActionName(actionResult) {
    const error = get(actionResult || {}, 'error');
    const placeholders = typeof error === 'object' && error ? error : {};
    return this.t(
      'failureNotificationActionName',
      placeholders, {
        defaultValue: '',
      }
    );
  },

  /**
   * @param {Utils.ActionResult} [actionResult]
   */
  notifySuccess(actionResult) {
    const successText = this.getSuccessNotificationText(actionResult);
    if (successText) {
      this.get('globalNotify').success(successText);
    }
  },

  /**
   * @param {Utils.ActionResult} [actionResult]
   */
  notifyFailure(actionResult) {
    const failureActionName = this.getFailureNotificationActionName(actionResult);
    if (failureActionName) {
      this.get('globalNotify')
        .backendError(failureActionName, get(actionResult || {}, 'error'));
    }
  },

  /**
   * @param {Utils.ActionResult} actionResult
   */
  notifyResult(actionResult) {
    switch (get(actionResult || {}, 'status')) {
      case 'done':
        this.notifySuccess(actionResult);
        break;
      case 'failed':
        this.notifyFailure(actionResult);
        break;
    }
  },
});
