/**
 * Retries specific lane run. Needs `workflow`, `lane`, `runNumber` and `retryLaneCallback`
 * passed via context.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Action from 'onedata-gui-common/utils/action';
import ActionResult from 'onedata-gui-common/utils/action-result';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import {
  equal,
  getBy,
  notEmpty,
  raw,
  not,
  and,
} from 'ember-awesome-macros';
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
  disabled: not(and('isWorkflowEnded', 'laneRun.isRetriable')),

  /**
   * @override
   */
  tip: computed(
    'isWorkflowEnded',
    'workflowStatus',
    'isLaneRunFailed',
    'doesLaneRunExceptionStoreExist',
    'disabled',
    function tip() {
      const {
        isWorkflowEnded,
        isLaneRunFailed,
        doesLaneRunExceptionStoreExist,
        disabled,
      } = this.getProperties(
        'isWorkflowEnded',
        'isLaneRunFailed',
        'doesLaneRunExceptionStoreExist',
        'disabled'
      );

      if (!disabled) {
        return null;
      }

      let translationName;
      if (!isWorkflowEnded) {
        translationName = 'workflowNotEnded';
      } else if (this.workflowStatus === 'crashed') {
        translationName = 'workflowCrashed';
      } else if (!isLaneRunFailed) {
        translationName = 'laneNotFailed';
      } else if (!doesLaneRunExceptionStoreExist) {
        translationName = 'noExceptionStoreAvailable';
      } else {
        // Lane run cannot be retried due to some backend constraints we don't know
        translationName = 'unknownReason';
      }

      return this.t(`disabledTip.${translationName}`);
    }
  ),

  /**
   * @type {ComputedProperty<Utils.WorkflowVisualiser.Workflow>}
   */
  workflow: reads('context.workflow'),

  /**
   * @type {ComputedProperty<AtmWorkflowExecutionStatus>}
   */
  workflowStatus: reads('workflow.status'),

  /**
   * @type {ComputedProperty<Utils.WorkflowVisualiser.Lane>}
   */
  lane: reads('context.lane'),

  /**
   * @type {ComputedProperty<AtmLaneRunNumber>}
   */
  runNumber: reads('context.runNumber'),

  /**
   * @param {Utils.WorkflowVisualiser.Lane} lane
   * @param {AtmLaneRunNumber} runNumber
   * @returns {Promise}
   * @type {ComputedProperty<Function>}
   */
  retryLaneCallback: reads('context.retryLaneCallback'),

  /**
   * @type {ComputedProperty<Boolean>}
   */
  isWorkflowEnded: computed('workflowStatus', function isWorkflowEnded() {
    return workflowEndedStatuses.includes(this.workflowStatus);
  }),

  /**
   * @type {ComputedProperty<Object>}
   */
  laneRun: getBy('lane.runsRegistry', 'runNumber'),

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
      runNumber,
    } = this.getProperties(
      'retryLaneCallback',
      'lane',
      'runNumber'
    );

    const result = ActionResult.create();
    return await result.interceptPromise(retryLaneCallback(lane, runNumber))
      .then(() => lane.showLatestRun())
      .then(() => result, () => result);
  },
});
