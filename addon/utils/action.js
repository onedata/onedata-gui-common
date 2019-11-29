/**
 * An abstract base class for all actions. To execute concrete action, simply call
 * execute().
 *
 * @module utils/action
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject, { computed, get } from '@ember/object';
import { reads } from '@ember/object/computed';
import notImplementedThrow from 'onedata-gui-common/utils/not-implemented-throw';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import OwnerInjector from 'onedata-gui-common/mixins/owner-injector';

export default EmberObject.extend(I18n, OwnerInjector, {
  i18n: service(),
  globalNotify: service(),

  /**
   * @virtual
   * @type {string}
   */
  title: undefined,

  /**
   * @virtual
   * Performs action
   */
  execute: notImplementedThrow,

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
  classNames: undefined,

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
   * Returns text used to notify action success (passed to global-notify).
   * @param {Utils.ActionResult} [actionResult]
   * @returns {HtmlSafe}
   */
  getSuccessNotificationText(actionResult) {
    return this.t('successNotificationText', get(actionResult || {}, 'result'));
  },

  /**
   * Returns action name used notify action failure (passed to global-notify).
   * @param {Utils.ActionResult} [actionResult]
   * @returns {HtmlSafe}
   */
  getFailureNotificationActionName(actionResult) {
    return this.t('failureNotificationActionName', get(actionResult || {}, 'error'));
  },

  /**
   * @param {Utils.ActionResult} [actionResult]
   */
  notifySuccess(actionResult) {
    const successText = this.getSuccessNotificationText(actionResult);
    this.get('globalNotify').success(successText);
  },

  /**
   * @param {Utils.ActionResult} [actionResult]
   */
  notifyFailure(actionResult) {
    const failureActionName = this.getFailureNotificationActionName(actionResult);
    this.get('globalNotify')
      .backendError(failureActionName, get(actionResult || {}, 'error'));
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
