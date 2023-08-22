/**
 * Shows link to a related automation element (task, exception store items, etc).
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022-2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed, get, set } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { or } from 'ember-awesome-macros';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import layout from 'onedata-gui-common/templates/components/modals/workflow-visualiser/store-modal/audit-log-presenter/references-cell';

export default Component.extend(I18n, {
  layout,
  tagName: 'td',
  classNames: ['references-cell', 'truncate'],

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.modals.workflowVisualiser.storeModal.auditLogPresenter.referencesCell',

  /**
   * @virtual
   * @type {AtmAuditLogEntryReferencedElements|undefined}
   */
  referencedElements: undefined,

  /**
   * @virtual
   * @type {Utils.WorkflowVisualiser.ActionsFactory}
   */
  actionsFactory: undefined,

  /**
   * @virtual optional
   * @type {(taskInstanceId: string) => { task: Utils.WorkflowVisualiser.Lane.Task, runNumber: number } | null}
   */
  getTaskRunForInstanceIdCallback: null,

  /**
   * If presented audit logs are taken from task, then this field contains that
   * task execution ID.
   * @virtual optional
   * @type {string | null}
   */
  taskExecutionId: null,

  /**
   * @type {ComputedProperty<string>}
   */
  referencedTaskExecutionId: computed(
    'referencedElements.tasks.[]',
    function referencedTaskExecutionId() {
      return this.get('referencedElements.tasks.0');
    }
  ),

  /**
   * @type {ComputedProperty<Array<string> | undefined>}
   */
  itemTraceIds: reads('referencedElements.itemTraceIds'),

  /**
   * @type {ComputedProperty<Utils.WorkflowVisualiser.Actions.ViewTaskAuditLogAction | null>}
   */
  openTaskAuditLogAction: computed(
    'referencedTaskExecutionId',
    'getTaskRunForInstanceIdCallback',
    'actionsFactory',
    function openTaskAuditLogAction() {
      const {
        referencedTaskExecutionId,
        getTaskRunForInstanceIdCallback,
        actionsFactory,
      } = this.getProperties(
        'referencedTaskExecutionId',
        'getTaskRunForInstanceIdCallback',
        'actionsFactory'
      );

      const taskRun =
        referencedTaskExecutionId &&
        getTaskRunForInstanceIdCallback?.(referencedTaskExecutionId);
      if (!taskRun || !actionsFactory) {
        return null;
      }

      const action = actionsFactory.createViewTaskAuditLogAction({
        task: taskRun.task,
        runNumber: taskRun.runNumber,
      });
      set(action, 'title', this.t('taskRef', { taskName: get(taskRun.task, 'name') }));

      return action;
    }
  ),

  /**
   * @type {ComputedProperty<Utils.WorkflowVisualiser.Actions.ViewLaneFailedItemsAction | null>}
   */
  openExceptionStoreAction: computed(
    'itemTraceIds',
    'taskExecutionId',
    'getTaskRunForInstanceIdCallback',
    'actionsFactory',
    function openExceptionStoreAction() {
      if (!this.itemTraceIds?.length || !this.actionsFactory) {
        return null;
      }

      const taskRun =
        this.taskExecutionId &&
        this.getTaskRunForInstanceIdCallback?.(this.taskExecutionId);
      const lane = taskRun?.task?.parent?.parent;
      if (!lane) {
        return null;
      }

      return this.actionsFactory.createViewLaneFailedItemsAction({
        lane,
        runNumber: taskRun.runNumber,
        itemTraceIdsToHighlight: this.itemTraceIds,
      });
    }
  ),

  /**
   * @type {ComputedProperty<Utils.Action | null>}
   */
  actionToUse: or('openTaskAuditLogAction', 'openExceptionStoreAction'),
});
