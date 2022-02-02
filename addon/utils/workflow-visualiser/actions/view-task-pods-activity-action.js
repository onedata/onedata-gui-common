/**
 * Shows activity of pods related to a task. Needs `task` and
 * `showPodsActivityCallback` passed via context.
 *
 * @module utils/workflow-visualiser/actions/view-task-pods-activity-action
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Action from 'onedata-gui-common/utils/action';
import { reads } from '@ember/object/computed';
import { not, eq, raw, or, notEmpty } from 'ember-awesome-macros';

export default Action.extend({
  /**
   * @override
   */
  i18nPrefix: 'components.workflowVisualiser.task.actions.viewTaskPodsActivity',

  /**
   * @override
   */
  className: 'view-task-pods-activity-action-trigger',

  /**
   * @override
   */
  disabled: or(not('isTaskAnOpenfaasFunction'), not('wasInstantiated')),

  /**
   * @type {ComputedProperty<Utils.WorkflowVisualiser.Lane.Task>}
   */
  task: reads('context.task'),

  /**
   * @type {ComputedProperty<(task: Utils.WorkflowVisualiser.Lane.Task) => Promise>}
   */
  showPodsActivityCallback: reads('context.showPodsActivityCallback'),

  /**
   * @type {ComputedProperty<boolean>}
   */
  isTaskAnOpenfaasFunction: eq(
    'task.lambdaRevision.operationSpec.engine',
    raw('openfaas')
  ),

  /**
   * @type {ComputedProperty<boolean>}
   */
  wasInstantiated: notEmpty('task.instanceId'),

  /**
   * @override
   */
  onExecute() {
    const {
      task,
      showPodsActivityCallback,
    } = this.getProperties(
      'task',
      'showPodsActivityCallback',
    );

    if (showPodsActivityCallback) {
      return showPodsActivityCallback(task);
    }
  },
});
