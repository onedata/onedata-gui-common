/**
 * Is responsible for creating actions used by workflow visualiser. This abstraction
 * is introduced to allow extending default actions via passing custom (extended)
 * actions factory to the visualiser.
 *
 * NOTE: single instance of the factory can be used only by the one workflow
 * visualiser at a time.
 *
 * @module utils/workflow-visualiser/actions-factory
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject from '@ember/object';
import ArrayProxy from '@ember/array/proxy';
import { reads } from '@ember/object/computed';
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
import CreateStoreAction from 'onedata-gui-common/utils/workflow-visualiser/actions/create-store-action';
import ViewStoreAction from 'onedata-gui-common/utils/workflow-visualiser/actions/view-store-action';
import ModifyStoreAction from 'onedata-gui-common/utils/workflow-visualiser/actions/modify-store-action';
import RemoveStoreAction from 'onedata-gui-common/utils/workflow-visualiser/actions/remove-store-action';

/**
 * @typedef {EmberObject} WorkflowDataProvider
 * @property {Array<Utils.WorkflowVisualiser.Store>} stores
 */

export default EmberObject.extend(OwnerInjector, {
  /**
   * @type {WorkflowDataProvider}
   */
  workflowDataProvider: undefined,

  /**
   * @param {WorkflowDataProvider} workflowDataProvider
   * @returns {undefined}
   */
  registerWorkflowDataProvider(workflowDataProvider) {
    this.set('workflowDataProvider', workflowDataProvider);
  },

  /**
   * @param {(newElementProps: Object) => Promise} context.createLaneCallback
   * @returns {Utils.WorkflowVisualiser.Actions.CreateLaneAction}
   */
  createCreateLaneAction(context) {
    const storesArrayProxy = ArrayProxy
      .extend({ content: reads('factory.workflowDataProvider.stores') })
      .create({ factory: this });

    return CreateLaneAction.create({
      ownerSource: this,
      context: Object.assign({
        stores: storesArrayProxy,
      }, context),
    });
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

  /**
   * @param {(newStoreProps: Object) => Promise} context.createStoreCallback
   * @returns {Utils.WorkflowVisualiser.Actions.CreateStoreAction}
   */
  createCreateStoreAction(context) {
    return CreateStoreAction.create({ ownerSource: this, context });
  },

  /**
   * @param {Utils.WorkflowVisualiser.Store} context.store
   * @returns {Utils.WorkflowVisualiser.Actions.ViewStoreAction}
   */
  createViewStoreAction(context) {
    return ViewStoreAction.create({ ownerSource: this, context });
  },

  /**
   * @param {Utils.WorkflowVisualiser.Store} context.store
   * @returns {Utils.WorkflowVisualiser.Actions.ModifyStoreAction}
   */
  createModifyStoreAction(context) {
    return ModifyStoreAction.create({ ownerSource: this, context });
  },

  /**
   * @param {Utils.WorkflowVisualiser.Store} context.store
   * @returns {Utils.WorkflowVisualiser.Actions.RemoveStoreAction}
   */
  createRemoveStoreAction(context) {
    return RemoveStoreAction.create({ ownerSource: this, context });
  },
});
