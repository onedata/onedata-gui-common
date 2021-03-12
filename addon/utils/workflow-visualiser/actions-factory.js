import EmberObject from '@ember/object';
import OwnerInjector from 'onedata-gui-common/mixins/owner-injector';
import CreateLaneAction from 'onedata-gui-common/utils/workflow-visualiser/actions/create-lane-action';
import MoveLeftLaneAction from 'onedata-gui-common/utils/workflow-visualiser/actions/move-left-lane-action';
import MoveRightLaneAction from 'onedata-gui-common/utils/workflow-visualiser/actions/move-right-lane-action';
import ClearLaneAction from 'onedata-gui-common/utils/workflow-visualiser/actions/clear-lane-action';
import RemoveLaneAction from 'onedata-gui-common/utils/workflow-visualiser/actions/remove-lane-action';
import CreateParallelBlockAction from 'onedata-gui-common/utils/workflow-visualiser/actions/create-parallel-block-action';
import MoveUpParallelBlockAction from 'onedata-gui-common/utils/workflow-visualiser/actions/move-up-parallel-block-action';
import MoveDownParallelBlockAction from 'onedata-gui-common/utils/workflow-visualiser/actions/move-down-parallel-block-action';
import RemoveParallelBlockAction from 'onedata-gui-common/utils/workflow-visualiser/actions/remove-parallel-block-action';
import CreateTaskAction from 'onedata-gui-common/utils/workflow-visualiser/actions/create-task-action';
import RemoveTaskAction from 'onedata-gui-common/utils/workflow-visualiser/actions/remove-task-action';

export default EmberObject.extend(OwnerInjector, {
  /**
   * @param {(newElementProps: Object) => Promise} context.createLaneCallback
   * @returns {Utils.WorkflowVisualiser.Actions.CreateLaneAction}
   */
  createCreateLaneAction(context) {
    return CreateLaneAction.create({ ownerSource: this, context });
  },

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
   * @param {(newElementProps: Object) => Promise} context.createParallelBlockCallback
   * @returns {Utils.WorkflowVisualiser.Actions.CreateParallelBlockAction}
   */
  createCreateParallelBlockAction(context) {
    return CreateParallelBlockAction.create({ ownerSource: this, context });
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

  /**
   * @param {(newElementProps: Object) => Promise} context.createTaskCallback
   * @returns {Utils.WorkflowVisualiser.Actions.CreateTaskAction}
   */
  createCreateTaskAction(context) {
    return CreateTaskAction.create({ ownerSource: this, context });
  },

  /**
   * @param {Utils.WorkflowVisualiser.Lane.Task} context.task
   * @returns {Utils.WorkflowVisualiser.Actions.RemoveTaskAction}
   */
  createRemoveTaskAction(context) {
    return RemoveTaskAction.create({ ownerSource: this, context });
  },
});
