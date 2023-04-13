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
 * For undoing action (executeUndo()) algorithm is basically the same except
 * calling `onExecuteUndo()` in the first step.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2019-2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject, { computed, get, set } from '@ember/object';
import { reads } from '@ember/object/computed';
import notImplementedThrow from 'onedata-gui-common/utils/not-implemented-throw';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import OwnerInjector from 'onedata-gui-common/mixins/owner-injector';
import ActionResult from 'onedata-gui-common/utils/action-result';

/**
 * @typedef {(result: Utils.ActionResult, action: Utils.Action) => Promise<void>} ActionExecuteHook
 */

export default EmberObject.extend(I18n, OwnerInjector, {
  i18n: service(),
  globalNotify: service(),

  /**
   * Performs action
   * @virtual
   * @private
   * @type {() => Promise<Utils.ActionResult|undefined>)}
   */
  onExecute: notImplementedThrow,

  /**
   * Performs action undo
   * @virtual
   * @private
   * @type {() => Promise<Utils.ActionResult|undefined>)}
   */
  onExecuteUndo: notImplementedThrow,

  /**
   * @virtual optional
   * @public
   * @type {string}
   */
  icon: undefined,

  /**
   * @virtual optional
   * @public
   * @type {string}
   */
  tip: undefined,

  /**
   * @virtual optional
   * @public
   * @type {string}
   */
  className: undefined,

  /**
   * @virtual optional
   * @public
   * @type {boolean}
   */
  disabled: false,

  /**
   * Action context. Can be used as a data source for execute().
   * @virtual optional
   * @public
   * @type {any}
   */
  context: null,

  /**
   * @virtual optional
   * @public
   * @type {ComputedProperty<String>}
   */
  title: computed('i18nPrefix', function title() {
    return this.t('title', {}, { defaultValue: '' });
  }),

  /**
   * Will be called just after the onExecute[Undo]() method. Are executed in
   * order and if some of them fails, then the following rest is not called.
   * Errors change action result.
   * @type {ComputedProperty<Array<ActionExecuteHook>>}
   */
  executeHooks: computed(() => []),

  /**
   * Callback ready to use inside hbs action helper
   * @public
   * @readonly
   * @type {Ember.ComputedProperty<() => Promise<Utils.ActionResult>>}
   */
  executeCallback: computed(function executeCallback() {
    return () => this.execute();
  }),

  /**
   * An alias to `executeCallback` to preserve compatibility with old usages of
   * action object. Maybe to remove in future.
   * @public
   * @readonly
   * @type {Ember.ComputedProperty<() => Promise<Utils.ActionResult>>}
   */
  action: reads('executeCallback'),

  /**
   * Executes action (onExecute and then execute hooks)
   * @public
   * @returns {Promise<Utils.ActionResult>}
   */
  async execute() {
    return await this.internalExecute();
  },

  /**
   * Executes action (onExecuteUndo and then execute hooks)
   * @public
   * @returns {Promise<Utils.ActionResult>}
   */
  async executeUndo() {
    return await this.internalExecute(true);
  },

  /**
   * Adds new execute hook at the end of the hooks list
   * @public
   * @param {ActionExecuteHook} hookCallback
   * @returns {void}
   */
  addExecuteHook(hookCallback) {
    this.get('executeHooks').push(hookCallback);
  },

  /**
   * Removes registered execute hook
   * @public
   * @param {ActionExecuteHook} hookCallback
   * @returns {void}
   */
  removeExecuteHook(hookCallback) {
    this.set('executeHooks', this.get('executeHooks').without(hookCallback));
  },

  /**
   * @private
   * @param {boolean} undo
   * @returns {Promise<Utils.ActionResult>}
   */
  async internalExecute(undo = false) {
    if (this.disabled) {
      return;
    }

    let result;
    try {
      result = await (undo ? this.onExecuteUndo() : this.onExecute());
      if (!result?.interceptPromise) {
        result = ActionResult.create({
          status: 'done',
          result,
        });
      }
    } catch (error) {
      if (!error?.interceptPromise) {
        result = ActionResult.create({
          status: 'failed',
          error,
        });
      } else {
        result = error;
      }
    }
    set(result, 'undo', undo);

    try {
      for (const executeHook of this.executeHooks) {
        await executeHook(result, this);
      }
    } catch (error) {
      result = ActionResult.create({
        status: 'failed',
        error,
        undo,
      });
    }

    this.notifyResult(result);
    return result;
  },

  /**
   * Returns text used to notify action success (passed to global-notify).
   * @private
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
   * @private
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
   * @private
   * @param {Utils.ActionResult} [actionResult]
   * @returns {void}
   */
  notifySuccess(actionResult) {
    const successText = this.getSuccessNotificationText(actionResult);
    if (successText) {
      this.get('globalNotify').success(successText);
    }
  },

  /**
   * @private
   * @param {Utils.ActionResult} [actionResult]
   * @returns {void}
   */
  notifyFailure(actionResult) {
    const failureActionName = this.getFailureNotificationActionName(actionResult);
    if (failureActionName) {
      this.get('globalNotify')
        .backendError(failureActionName, get(actionResult || {}, 'error'));
    }
  },

  /**
   * @private
   * @param {Utils.ActionResult} actionResult
   * @returns {void}
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
