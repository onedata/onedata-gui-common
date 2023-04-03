/**
 * Reruns specific lane run. Needs `workflow`, `lane`, `runNumber` and `rerunLaneCallback`
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
import { raw, eq, and, not, getBy } from 'ember-awesome-macros';
import { workflowEndedStatuses } from 'onedata-gui-common/utils/workflow-visualiser/statuses';
import { inAdvanceRunNumber } from 'onedata-gui-common/utils/workflow-visualiser/run-utils';

export default Action.extend({
  modalManager: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.workflowVisualiser.lane.actions.rerunLane',

  /**
   * @override
   */
  className: 'rerun-lane-action-trigger',

  /**
   * @override
   */
  icon: 'play',

  /**
   * @override
   */
  disabled: not(and('isWorkflowEnded', 'laneRun.isRerunable')),

  /**
   * @override
   */
  tip: computed(
    'isRunPreparedInAdvance',
    'isWorkflowEnded',
    'workflowStatus',
    'disabled',
    function tip() {
      const {
        isRunPreparedInAdvance,
        isWorkflowEnded,
        disabled,
      } = this.getProperties(
        'isRunPreparedInAdvance',
        'isWorkflowEnded',
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
      } else if (isRunPreparedInAdvance) {
        translationName = 'preparedInAdvance';
      } else {
        // Lane run cannot be rerun due to some backend constraints we don't know
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
  rerunLaneCallback: reads('context.rerunLaneCallback'),

  /**
   * @type {ComputedProperty<Boolean>}
   */
  isRunPreparedInAdvance: eq('runNumber', raw(inAdvanceRunNumber)),

  /**
   * @type {ComputedProperty<Object>}
   */
  laneRun: getBy('lane.runsRegistry', 'runNumber'),

  /**
   * @type {ComputedProperty<Boolean>}
   */
  isWorkflowEnded: computed('workflowStatus', function isWorkflowEnded() {
    return workflowEndedStatuses.includes(this.workflowStatus);
  }),

  /**
   * @override
   */
  async onExecute() {
    const {
      rerunLaneCallback,
      lane,
      runNumber,
    } = this.getProperties(
      'rerunLaneCallback',
      'lane',
      'runNumber'
    );

    const result = ActionResult.create();
    return await result.interceptPromise(rerunLaneCallback(lane, runNumber))
      .then(() => lane.showLatestRun())
      .then(() => result, () => result);
  },
});
