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
import ModifyLaneAction from 'onedata-gui-common/utils/workflow-visualiser/actions/modify-lane-action';
import ViewLaneAction from 'onedata-gui-common/utils/workflow-visualiser/actions/view-lane-action';
import MoveLeftLaneAction from 'onedata-gui-common/utils/workflow-visualiser/actions/move-left-lane-action';
import MoveRightLaneAction from 'onedata-gui-common/utils/workflow-visualiser/actions/move-right-lane-action';
import ClearLaneAction from 'onedata-gui-common/utils/workflow-visualiser/actions/clear-lane-action';
import RemoveLaneAction from 'onedata-gui-common/utils/workflow-visualiser/actions/remove-lane-action';
import CreateParallelBoxAction from 'onedata-gui-common/utils/workflow-visualiser/actions/create-parallel-box-action';
import MoveUpParallelBoxAction from 'onedata-gui-common/utils/workflow-visualiser/actions/move-up-parallel-box-action';
import MoveDownParallelBoxAction from 'onedata-gui-common/utils/workflow-visualiser/actions/move-down-parallel-box-action';
import RemoveParallelBoxAction from 'onedata-gui-common/utils/workflow-visualiser/actions/remove-parallel-box-action';
import CreateTaskAction from 'onedata-gui-common/utils/workflow-visualiser/actions/create-task-action';
import RemoveTaskAction from 'onedata-gui-common/utils/workflow-visualiser/actions/remove-task-action';
import CreateStoreAction from 'onedata-gui-common/utils/workflow-visualiser/actions/create-store-action';
import ViewStoreAction from 'onedata-gui-common/utils/workflow-visualiser/actions/view-store-action';
import ModifyStoreAction from 'onedata-gui-common/utils/workflow-visualiser/actions/modify-store-action';
import RemoveStoreAction from 'onedata-gui-common/utils/workflow-visualiser/actions/remove-store-action';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';

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
   * @type {Function}
   * @param {String} mode one of `'create'`, `'edit'`
   * @param {Array<Object>} [initialData.stores]
   * @param {Object} [initialData.task] needed only if `mode` is `'edit'`
   * @returns {Promise<Object>} task details
   */
  taskDetailsProviderCallback: notImplementedIgnore,

  /**
   * @param {WorkflowDataProvider} workflowDataProvider
   * @returns {undefined}
   */
  registerWorkflowDataProvider(workflowDataProvider) {
    this.set('workflowDataProvider', workflowDataProvider);
  },

  /**
   * @param {Function} taskDetailsProviderCallback
   */
  registerTaskDetailsProviderCallback(taskDetailsProviderCallback) {
    this.set('taskDetailsProviderCallback', taskDetailsProviderCallback);
  },

  /**
   * @param {(newElementProps: Object) => Promise} context.createLaneCallback
   * @returns {Utils.WorkflowVisualiser.Actions.CreateLaneAction}
   */
  createCreateLaneAction(context) {
    return CreateLaneAction.create({
      ownerSource: this,
      context: Object.assign({
        stores: this.getStoresArrayProxy(),
      }, context),
    });
  },

  /**
   * @param {Utils.WorkflowVisualiser.Lane} context.lane
   * @returns {Utils.WorkflowVisualiser.Actions.ModifyLaneAction}
   */
  createModifyLaneAction(context) {
    return ModifyLaneAction.create({
      ownerSource: this,
      context: Object.assign({
        stores: this.getStoresArrayProxy(),
      }, context),
    });
  },

  /**
   * @param {Utils.WorkflowVisualiser.Lane} context.lane
   * @returns {Utils.WorkflowVisualiser.Actions.ViewLaneAction}
   */
  createViewLaneAction(context) {
    return ViewLaneAction.create({
      ownerSource: this,
      context: Object.assign({
        stores: this.getStoresArrayProxy(),
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
   * @param {(newElementProps: Object) => Promise} context.createParallelBoxCallback
   * @returns {Utils.WorkflowVisualiser.Actions.CreateParallelBoxAction}
   */
  createCreateParallelBoxAction(context) {
    return CreateParallelBoxAction.create({ ownerSource: this, context });
  },

  /**
   * @param {Utils.WorkflowVisualiser.Lane.ParallelBox} context.parallelBox
   * @returns {Utils.WorkflowVisualiser.Actions.MoveUpParallelBoxAction}
   */
  createMoveUpParallelBoxAction(context) {
    return MoveUpParallelBoxAction.create({ ownerSource: this, context });
  },

  /**
   * @param {Utils.WorkflowVisualiser.Lane.ParallelBox} context.parallelBox
   * @returns {Utils.WorkflowVisualiser.Actions.MoveDownParallelBoxAction}
   */
  createMoveDownParallelBoxAction(context) {
    return MoveDownParallelBoxAction.create({ ownerSource: this, context });
  },

  /**
   * @param {Utils.WorkflowVisualiser.Lane.ParallelBox} context.parallelBox
   * @returns {Utils.WorkflowVisualiser.Actions.RemoveParallelBoxAction}
   */
  createRemoveParallelBoxAction(context) {
    return RemoveParallelBoxAction.create({ ownerSource: this, context });
  },

  /**
   * @param {(newElementProps: Object) => Promise} context.createTaskCallback
   * @returns {Utils.WorkflowVisualiser.Actions.CreateTaskAction}
   */
  createCreateTaskAction(context) {
    return CreateTaskAction.create({
      ownerSource: this,
      context: Object.assign({
        stores: this.getStoresArrayProxy(),
        taskDetailsProviderCallback: this.get('taskDetailsProviderCallback'),
      }, context),
    });
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

  /**
   * @private
   * @returns {ArrayProxy<Utils.WorkflowVisualiser.Store>}
   */
  getStoresArrayProxy() {
    return ArrayProxy
      .extend({ content: reads('factory.workflowDataProvider.stores') })
      .create({ factory: this });
  },
});
