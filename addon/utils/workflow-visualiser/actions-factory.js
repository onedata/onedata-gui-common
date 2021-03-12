import EmberObject from '@ember/object';
import OwnerInjector from 'onedata-gui-common/mixins/owner-injector';
import MoveLeftLaneAction from 'onedata-gui-common/utils/workflow-visualiser/actions/move-left-lane-action';
import MoveRightLaneAction from 'onedata-gui-common/utils/workflow-visualiser/actions/move-right-lane-action';
import ClearLaneAction from 'onedata-gui-common/utils/workflow-visualiser/actions/clear-lane-action';
import RemoveLaneAction from 'onedata-gui-common/utils/workflow-visualiser/actions/remove-lane-action';

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
});
