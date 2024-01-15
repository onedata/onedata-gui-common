/**
 * Shows task time series. Needs `task` and `getTimeSeriesContentCallback` passed via context.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Action from 'onedata-gui-common/utils/action';
import ActionResult from 'onedata-gui-common/utils/action-result';
import { set, get } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { not } from 'ember-awesome-macros';

export default Action.extend({
  modalManager: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.workflowVisualiser.task.actions.viewTaskTimeSeries',

  /**
   * @override
   */
  className: 'view-task-time-series-action-trigger',

  /**
   * @override
   */
  disabled: not('task.timeSeriesStore'),

  /**
   * @type {ComputedProperty<Utils.WorkflowVisualiser.Lane.Task>}
   */
  task: reads('context.task'),

  /**
   * @type {ComputedProperty<Function>}
   */
  getTimeSeriesContentCallback: reads('context.getTimeSeriesContentCallback'),

  /**
   * @type {ComputedProperty<() => AtmTimeSeriesCollectionReferencesMap>}
   */
  getTimeSeriesCollectionRefsMapCallback: reads(
    'context.getTimeSeriesCollectionRefsMapCallback'
  ),

  /**
   * @override
   */
  onExecute() {
    const {
      task,
      getTimeSeriesContentCallback,
      modalManager,
    } = this.getProperties(
      'task',
      'getTimeSeriesContentCallback',
      'modalManager'
    );
    const timeSeriesStore = get(task, 'timeSeriesStore');

    const result = ActionResult.create();
    return modalManager
      .show('workflow-visualiser/store-modal', {
        mode: 'view',
        viewModeLayout: 'timeSeries',
        subjectName: this.t('subjectName', { taskName: get(task, 'name') }),
        store: timeSeriesStore,
        getStoreContentCallback: (...args) =>
          getTimeSeriesContentCallback(timeSeriesStore, ...args),
        getTimeSeriesCollectionRefsMapCallback: (...args) =>
          this.getTimeSeriesCollectionRefsMapCallback(task.visibleRunNumber, ...args),
      }).hiddenPromise
      .then(() => {
        set(result, 'status', 'done');
        return result;
      });
  },
});
