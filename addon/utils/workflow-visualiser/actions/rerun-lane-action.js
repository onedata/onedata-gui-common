/**
 * Reruns specific lane run. Needs `workflow`, `lane`, `runNo` and `rerunLaneCallback`
 * passed via context.
 *
 * @module utils/workflow-visualiser/actions/rerun-lane-action
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Action from 'onedata-gui-common/utils/action';
import ActionResult from 'onedata-gui-common/utils/action-result';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { conditional, raw } from 'ember-awesome-macros';
import { workflowEndedStatuses } from 'onedata-gui-common/utils/workflow-visualiser/statuses';
import computedT from 'onedata-gui-common/utils/computed-t';

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
  disabled: computed('workflow.status', function disabled() {
    return !workflowEndedStatuses.includes(this.get('workflow.status'));
  }),

  /**
   * @override
   */
  tip: conditional(
    'disabled',
    computedT('disabledTip'),
    raw(null)
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
  rerunLaneCallback: reads('context.rerunLaneCallback'),

  /**
   * @override
   */
  async onExecute() {
    const {
      rerunLaneCallback,
      lane,
      runNo,
    } = this.getProperties(
      'rerunLaneCallback',
      'lane',
      'runNo'
    );

    const result = ActionResult.create();
    return await result.interceptPromise(rerunLaneCallback(lane, runNo))
      .then(() => lane.showLatestRun())
      .then(() => result, () => result);
  },
});
