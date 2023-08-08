/**
 * Shows hyperlink to a related task audit log (if exists).
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed, get, set } from '@ember/object';
import layout from 'onedata-gui-common/templates/components/modals/workflow-visualiser/store-modal/audit-log-presenter/related-logs-cell';

export default Component.extend({
  layout,
  tagName: 'td',
  classNames: ['related-logs-cell', 'truncate'],

  /**
   * @virtual
   * @type {AtmAuditLogEntryReferencedElements|undefined}
   */
  referencedElements: undefined,

  /**
   * @virtual
   * @type {(taskInstanceId: string) => { task: Utils.WorkflowVisualiser.Lane.Task, runNumber: number } | null}
   */
  getTaskRunForInstanceIdCallback: undefined,

  /**
   * @virtual
   * @type {Utils.WorkflowVisualiser.ActionsFactory}
   */
  actionsFactory: undefined,

  /**
   * @type {ComputedProperty<string>}
   */
  taskExecutionId: computed('referencedElements', function taskExecutionId() {
    return this.get('referencedElements.tasks.0');
  }),

  /**
   * @type {ComputedProperty<Utils.WorkflowVisualiser.Actions.ViewTaskAuditLogAction | null>}
   */
  openRelatedTaskAuditLogAction: computed(
    'taskExecutionId',
    'getTaskRunForInstanceIdCallback',
    'actionsFactory',
    function openRelatedTaskAuditLogAction() {
      const {
        taskExecutionId,
        getTaskRunForInstanceIdCallback,
        actionsFactory,
      } = this.getProperties(
        'taskExecutionId',
        'getTaskRunForInstanceIdCallback',
        'actionsFactory'
      );

      const taskRun =
        taskExecutionId && getTaskRunForInstanceIdCallback?.(taskExecutionId);
      if (!taskRun || !actionsFactory) {
        return null;
      }

      const action = actionsFactory.createViewTaskAuditLogAction({
        task: taskRun.task,
        runNumber: taskRun.runNumber,
      });
      set(action, 'title', get(taskRun.task, 'name'));

      return action;
    }
  ),
});
