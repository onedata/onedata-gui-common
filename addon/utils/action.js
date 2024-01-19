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

import EmberObject, { computed, get, set, trySet } from '@ember/object';
import { reads } from '@ember/object/computed';
import notImplementedThrow from 'onedata-gui-common/utils/not-implemented-throw';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import OwnerInjector from 'onedata-gui-common/mixins/owner-injector';
import ActionResult from 'onedata-gui-common/utils/action-result';

/**
 * @typedef {'possible' | 'impossible' | 'notApplicable'} ActionUndoPossibility
 * - `'possible'` means, that execution of an action can fully be undone,
 * - `'impossible'` means, that execution of an action can't be undone,
 * - `'notApplicable'` means, that execution of an action does not introduce any
 *   changes, that can be considered in terms of modification, so effectively
 *   there is nothing to undo. Main example of such action is an action, which
 *   only changes state of some model presentation and doesn't change properties
 *   of the model itself (like element selection, changing tab, etc.).
 */

/**
 * @type {Object<string, ActionUndoPossibility>}
 */
export const ActionUndoPossibility = Object.freeze({
  Possible: 'possible',
  Impossible: 'impossible',
  NotApplicable: 'notApplicable',
});

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
   * @virtual optional
   * @private
   * @type {() => Promise<Utils.ActionResult|undefined>)}
   */
  onExecuteUndo: notImplementedThrow,

  /**
   * @virtual optional
   * @public
   * @type {ActionUndoPossibility}
   */
  undoPossibility: ActionUndoPossibility.Impossible,

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
  title: computed('i18nPrefix', {
    get() {
      return this.injectedTitle ?? this.t('title', {}, { defaultValue: '' });
    },
    set(key, value) {
      return this.injectedTitle = value;
    },
  }),

  /**
   * @type {string | null}
   */
  injectedTitle: null,

  /**
   * `true` when action has been executed, `false` otherwise.
   * NOTE: calling `executeUndo` also sets it to `false`, as action is then
   * considered as non-executed.
   * @public
   * @type {boolean}
   */
  wasExecuted: false,

  /**
   * Will be called just after the onExecute[Undo]() method. Are executed in
   * order and if some of them fails, then the following rest is not called.
   * Errors change action result.
   * @type {ComputedProperty<Array<ActionExecuteHook>>}
   */
  executeHooks: undefined,

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
   * @override
   */
  init() {
    this._super(...arguments);
    this.set('executeHooks', []);
  },

  /**
   * @override
   */
  willDestroy() {
    try {
      if (this.context) {
        this.set('context', null);
      }
    } finally {
      this._super(...arguments);
    }
  },

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
    trySet(this, 'wasExecuted', !undo);
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
