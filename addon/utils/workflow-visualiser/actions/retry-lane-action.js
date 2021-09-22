/**
 * Retries specific lane run. Needs `workflow`, `lane`, `runNo` and `retryLaneCallback`
 * passed via context.
 *
 * @module utils/workflow-visualiser/actions/retry-lane-action
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Action from 'onedata-gui-common/utils/action';
import ActionResult from 'onedata-gui-common/utils/action-result';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { equal, getBy, notEmpty, raw, not, and } from 'ember-awesome-macros';
import { workflowEndedStatuses } from 'onedata-gui-common/utils/workflow-visualiser/statuses';

export default Action.extend({
  modalManager: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.workflowVisualiser.lane.actions.retryLane',

  /**
   * @override
   */
  className: 'retry-lane-action-trigger',

  /**
   * @override
   */
  icon: 'rerun',

  /**
   * @override
   */
  disabled: not(and(
    'isWorkflowEnded',
    'isLaneRunFailed',
    'doesLaneRunExceptionStoreExist'
  )),

  /**
   * @override
   */
  tip: computed(
    'isWorkflowEnded',
    'isLaneRunFailed',
    'doesLaneRunExceptionStoreExist',
    function disabled() {
      const {
        isWorkflowEnded,
        isLaneRunFailed,
        doesLaneRunExceptionStoreExist,
      } = this.getProperties(
        'isWorkflowEnded',
        'isLaneRunFailed',
        'doesLaneRunExceptionStoreExist'
      );

      let translationName;
      if (!isWorkflowEnded) {
        translationName = 'workflowNotEnded';
      } else if (!isLaneRunFailed) {
        translationName = 'laneNotFailed';
      } else if (!doesLaneRunExceptionStoreExist) {
        translationName = 'noExceptionStoreAvailable';
      }

      return translationName ? this.t(`disabledTip.${translationName}`) : null;
    }
  ),

  /**
   * @type {ComputedProperty<Utils.WorkflowVisualiser.Workflow>}
   */
  workflow: reads('context.workflow'),

  /**
   * @type {ComputedProperty<Utils.WorkflowVisualiser.Lane>}
   */
  lane: reads('context.lane'),

  /**
   * @type {ComputedProperty<Number>}
   */
  runNo: reads('context.runNo'),

  /**
   * @param {Utils.WorkflowVisualiser.Lane} lane
   * @param {Number} runNo
   * @returns {Promise}
   * @type {ComputedProperty<Function>}
   */
  retryLaneCallback: reads('context.retryLaneCallback'),

  /**
   * @type {ComputedProperty<Boolean>}
   */
  isWorkflowEnded: computed('workflow.status', function isWorkflowEnded() {
    return workflowEndedStatuses.includes(this.get('workflow.status'));
  }),

  /**
   * @type {ComputedProperty<Object>}
   */
  laneRun: getBy('lane.runs', 'runNo'),

  /**
   * @type {ComputedProperty<Boolean>}
   */
  isLaneRunFailed: equal('laneRun.status', raw('failed')),

  /**
   * @type {ComputedProperty<Boolean>}
   */
  doesLaneRunExceptionStoreExist: notEmpty('laneRun.exceptionStore'),

  /**
   * @override
   */
  async onExecute() {
    const {
      retryLaneCallback,
      lane,
      runNo,
    } = this.getProperties(
      'retryLaneCallback',
      'lane',
      'runNo'
    );

    const result = ActionResult.create();
    return await result.interceptPromise(retryLaneCallback(lane, runNo))
      .then(() => lane.showLatestRun())
      .then(() => result, () => result);
  },
});
