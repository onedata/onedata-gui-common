import EmberObject from '@ember/object';
import OwnerInjector from 'onedata-gui-common/mixins/owner-injector';
import MoveLeftLaneAction from 'onedata-gui-common/utils/workflow-visualiser/actions/move-left-lane-action';
import MoveRightLaneAction from 'onedata-gui-common/utils/workflow-visualiser/actions/move-right-lane-action';
import ClearLaneAction from 'onedata-gui-common/utils/workflow-visualiser/actions/clear-lane-action';
import RemoveLaneAction from 'onedata-gui-common/utils/workflow-visualiser/actions/remove-lane-action';
import MoveUpParallelBlockAction from 'onedata-gui-common/utils/workflow-visualiser/actions/move-up-parallel-block-action';
import MoveDownParallelBlockAction from 'onedata-gui-common/utils/workflow-visualiser/actions/move-down-parallel-block-action';
import RemoveParallelBlockAction from 'onedata-gui-common/utils/workflow-visualiser/actions/remove-parallel-block-action';

export default EmberObject.extend(OwnerInjector, {
  /**
   * @param {Utils.WorkflowVisualiser.Lane} context.lane
   * @returns {Utils.WorkflowVisualiser.Actions.MoveLeftLaneAction}
   */
  createMoveLeftLaneAction(context) {
    return MoveLeftLaneAction.create({ ownerSource: this, context });
  },

  /**
   * @param {Utils.WorkflowVisualiser.Lane} context.lane
   * @returns {Utils.WorkflowVisualiser.Actions.MoveRightLaneAction}
   */
  createMoveRightLaneAction(context) {
    return MoveRightLaneAction.create({ ownerSource: this, context });
  },

  /**
   * @param {Utils.WorkflowVisualiser.Lane} context.lane
   * @returns {Utils.WorkflowVisualiser.Actions.ClearLaneAction}
   */
  createClearLaneAction(context) {
    return ClearLaneAction.create({ ownerSource: this, context });
  },

  /**
   * @param {Utils.WorkflowVisualiser.Lane} context.lane
   * @returns {Utils.WorkflowVisualiser.Actions.RemoveLaneAction}
   */
  createRemoveLaneAction(context) {
    return RemoveLaneAction.create({ ownerSource: this, context });
  },

  /**
   * @param {Utils.WorkflowVisualiser.Lane.ParallelBlock} context.parallelBlock
   * @returns {Utils.WorkflowVisualiser.Actions.MoveUpParallelBlockAction}
   */
  createMoveUpParallelBlockAction(context) {
    return MoveUpParallelBlockAction.create({ ownerSource: this, context });
  },

  /**
   * @param {Utils.WorkflowVisualiser.Lane.ParallelBlock} context.parallelBlock
   * @returns {Utils.WorkflowVisualiser.Actions.MoveDownParallelBlockAction}
   */
  createMoveDownParallelBlockAction(context) {
    return MoveDownParallelBlockAction.create({ ownerSource: this, context });
  },

  /**
   * @param {Utils.WorkflowVisualiser.Lane.ParallelBlock} context.parallelBlock
   * @returns {Utils.WorkflowVisualiser.Actions.RemoveParallelBlockAction}
   */
  createRemoveParallelBlockAction(context) {
    return RemoveParallelBlockAction.create({ ownerSource: this, context });
  },
});
