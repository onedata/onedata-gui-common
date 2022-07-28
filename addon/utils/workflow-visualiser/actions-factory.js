// TODO: VFS-9257 fix eslint issues in this file
/* eslint-disable jsdoc/require-returns */

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

import EmberObject, { get } from '@ember/object';
import ArrayProxy from '@ember/array/proxy';
import ObjectProxy from '@ember/object/proxy';
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
import ModifyTaskAction from 'onedata-gui-common/utils/workflow-visualiser/actions/modify-task-action';
import RemoveTaskAction from 'onedata-gui-common/utils/workflow-visualiser/actions/remove-task-action';
import CreateStoreAction from 'onedata-gui-common/utils/workflow-visualiser/actions/create-store-action';
import ViewStoreAction from 'onedata-gui-common/utils/workflow-visualiser/actions/view-store-action';
import ModifyStoreAction from 'onedata-gui-common/utils/workflow-visualiser/actions/modify-store-action';
import RemoveStoreAction from 'onedata-gui-common/utils/workflow-visualiser/actions/remove-store-action';
import ViewWorkflowAuditLogAction from 'onedata-gui-common/utils/workflow-visualiser/actions/view-workflow-audit-log-action';
import ViewTaskAuditLogAction from 'onedata-gui-common/utils/workflow-visualiser/actions/view-task-audit-log-action';
import ViewTaskTimeSeriesAction from 'onedata-gui-common/utils/workflow-visualiser/actions/view-task-time-series-action';
import ViewLaneFailedItemsAction from 'onedata-gui-common/utils/workflow-visualiser/actions/view-lane-failed-items-action';
import RetryLaneAction from 'onedata-gui-common/utils/workflow-visualiser/actions/retry-lane-action';
import RerunLaneAction from 'onedata-gui-common/utils/workflow-visualiser/actions/rerun-lane-action';
import ViewTaskPodsActivityAction from 'onedata-gui-common/utils/workflow-visualiser/actions/view-task-pods-activity-action';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';

export default EmberObject.extend(OwnerInjector, {
  /**
   * @type {Utils.WorkflowVisualiser.WorkflowDataProvider}
   */
  workflowDataProvider: undefined,

  /**
   * @type {Function}
   * @param {Array<Object>} initialData.definedStores
   * @returns {Promise<Object>} task details
   */
  getTaskCreationDataCallback: undefined,

  /**
   * @type {Function}
   * @param {Array<Object>} initialData.definedStores
   * @param {Object} initialData.task
   * @returns {Promise<Object>} task details
   */
  getTaskModificationDataCallback: undefined,

  /**
   * @type {Function}
   * @param {Object} newStoreProperties
   * @returns {Promise<Object>} created store
   */
  createStoreCallback: undefined,

  /**
   * @type {Function}
   * @param {Utils.WorkflowVisualiser.Lane} lane
   * @param {AtmLaneRunNumber} runNumber
   * @returns {Promise}
   */
  retryLaneCallback: undefined,

  /**
   * @type {Function}
   * @param {Utils.WorkflowVisualiser.Lane} lane
   * @param {AtmLaneRunNumber} runNumber
   * @returns {Promise}
   */
  rerunLaneCallback: undefined,

  /**
   * @type {Function}
   * @param {Utils.WorkflowVisualiser.Lane.Task}
   * @returns {Promise}
   */
  showTaskPodsActivityCallback: undefined,

  /**
   * @param {WorkflowDataProvider} workflowDataProvider
   * @returns {undefined}
   */
  setWorkflowDataProvider(workflowDataProvider) {
    if (this.get('workflowDataProvider')) {
      console.warn(
        'util:workflow-visualiser/actions-factory#setWorkflowDataProvider: overriding workflowDataProvider');
    }
    this.set('workflowDataProvider', workflowDataProvider);
  },

  /**
   * @param {Function} getTaskCreationDataCallback
   */
  setGetTaskCreationDataCallback(getTaskCreationDataCallback) {
    if (this.get('getTaskCreationDataCallback')) {
      console.warn(
        'util:workflow-visualiser/actions-factory#setGetTaskCreationDataCallback: overriding getTaskCreationDataCallback'
      );
    }
    this.set('getTaskCreationDataCallback', getTaskCreationDataCallback);
  },

  /**
   * @param {Function} getTaskModificationDataCallback
   */
  setGetTaskModificationDataCallback(getTaskModificationDataCallback) {
    if (this.get('getTaskModificationDataCallback')) {
      console.warn(
        'util:workflow-visualiser/actions-factory#setGetTaskModificationDataCallback: overriding getTaskModificationDataCallback'
      );
    }
    this.set('getTaskModificationDataCallback', getTaskModificationDataCallback);
  },

  /**
   * @param {Function} createStoreCallback
   */
  setCreateStoreCallback(createStoreCallback) {
    if (this.get('createStoreCallback')) {
      console.warn(
        'util:workflow-visualiser/actions-factory#setCreateStoreCallback: overriding createStoreCallback');
    }
    this.set('createStoreCallback', createStoreCallback);
  },

  /**
   * @param {Function} retryLaneCallback
   */
  setRetryLaneCallback(retryLaneCallback) {
    if (this.get('retryLaneCallback')) {
      console.warn('util:workflow-visualiser/actions-factory#setRetryLaneCallback: overriding retryLaneCallback');
    }
    this.set('retryLaneCallback', retryLaneCallback);
  },

  /**
   * @param {Function} rerunLaneCallback
   */
  setRerunLaneCallback(rerunLaneCallback) {
    if (this.get('rerunLaneCallback')) {
      console.warn('util:workflow-visualiser/actions-factory#setRerunLaneCallback: overriding rerunLaneCallback');
    }
    this.set('rerunLaneCallback', rerunLaneCallback);
  },

  /**
   * @param {Function} showTaskPodsActivityCallback
   */
  setShowTaskPodsActivityCallback(showTaskPodsActivityCallback) {
    if (this.get('rerunLaneCallback')) {
      console.warn(
        'util:workflow-visualiser/actions-factory#setShowTaskPodsActivityCallback: overriding showTaskPodsActivityCallback'
      );
    }
    this.set('showTaskPodsActivityCallback', showTaskPodsActivityCallback);
  },

  /**
   * @param {(newElementProps: Object) => Promise} context.createLaneCallback
   * @returns {Utils.WorkflowVisualiser.Actions.CreateLaneAction}
   */
  createCreateLaneAction(context) {
    return CreateLaneAction.create({
      ownerSource: this,
      context: Object.assign({
        definedStores: this.getDefinedStoresArrayProxy(),
        createStoreAction: this.createCreateStoreAction(),
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
        definedStores: this.getDefinedStoresArrayProxy(),
        createStoreAction: this.createCreateStoreAction(),
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
        definedStores: this.getDefinedStoresArrayProxy(),
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
        definedStores: this.getDefinedStoresArrayProxy(),
        taskDetailsProviderCallback: this.get('getTaskCreationDataCallback') || notImplementedIgnore,
      }, context),
    });
  },

  /**
   * @param {Utils.WorkflowVisualiser.Lane.Task} context.task
   * @returns {Utils.WorkflowVisualiser.Actions.ModifyTaskAction}
   */
  createModifyTaskAction(context) {
    return ModifyTaskAction.create({
      ownerSource: this,
      context: Object.assign({
        definedStores: this.getDefinedStoresArrayProxy(),
        taskDetailsProviderCallback: this.get('getTaskModificationDataCallback') || notImplementedIgnore,
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
   * @param {Object} context
   * @returns {Utils.WorkflowVisualiser.Actions.CreateStoreAction}
   */
  createCreateStoreAction(context) {
    return CreateStoreAction.create({
      ownerSource: this,
      context: Object.assign({
        createStoreCallback: this.get('createStoreCallback') || notImplementedIgnore,
      }, context),
    });
  },

  /**
   * @param {Utils.WorkflowVisualiser.Store} context.store
   * @returns {Utils.WorkflowVisualiser.Actions.ViewStoreAction}
   */
  createViewStoreAction(context) {
    return ViewStoreAction.create({
      ownerSource: this,
      context: Object.assign({
        getStoreContentCallback: (...args) =>
          this.get('workflowDataProvider').getStoreContent(...args),
      }, context),
    });
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
   * @returns {Utils.WorkflowVisualiser.Actions.ViewWorkflowAuditLogAction}
   */
  createViewWorkflowAuditLogAction(context) {
    const workflow = this.get('workflowDataProvider.workflow');
    return ViewWorkflowAuditLogAction.create({
      ownerSource: this,
      context: Object.assign({
        actionsFactory: this,
        workflow: this.get('workflowDataProvider.workflow'),
        getAuditLogContentCallback: (...args) =>
          this.get('workflowDataProvider').getStoreContent(
            get(workflow, 'systemAuditLogStore'),
            ...args
          ),
        getTaskRunForInstanceIdCallback: (...args) =>
          this.get('workflowDataProvider').getTaskRunForInstanceId(...args),
      }, context),
    });
  },

  /**
   * @param {Utils.WorkflowVisualiser.Lane.Task} context.task
   * @returns {Utils.WorkflowVisualiser.Actions.ViewTaskAuditLogAction}
   */
  createViewTaskAuditLogAction(context) {
    return ViewTaskAuditLogAction.create({
      ownerSource: this,
      context: Object.assign({
        getAuditLogContentCallback: (...args) =>
          this.get('workflowDataProvider').getStoreContent(...args),
      }, context),
    });
  },

  /**
   * @param {Utils.WorkflowVisualiser.Lane.Task} context.task
   * @returns {Utils.WorkflowVisualiser.Actions.ViewTaskTimeSeriesAction}
   */
  createViewTaskTimeSeriesAction(context) {
    return ViewTaskTimeSeriesAction.create({
      ownerSource: this,
      context: Object.assign({
        getTimeSeriesContentCallback: (...args) =>
          this.get('workflowDataProvider').getStoreContent(...args),
      }, context),
    });
  },

  /**
   * @param {Utils.WorkflowVisualiser.Lane} context.lane
   * @param {AtmLaneRunNumber} [context.runNumber]
   * @returns {Utils.WorkflowVisualiser.Actions.ViewLaneFailedItemsAction}
   */
  createViewLaneFailedItemsAction(context) {
    return ViewLaneFailedItemsAction.create({
      ownerSource: this,
      context: Object.assign({
        getStoreContentCallback: (...args) =>
          this.get('workflowDataProvider').getStoreContent(...args),
      }, context),
    });
  },

  /**
   * @param {Utils.WorkflowVisualiser.Lane} context.lane
   * @param {AtmLaneRunNumber} context.runNumber
   * @returns {Utils.WorkflowVisualiser.Actions.RetryLaneAction}
   */
  createRetryLaneAction(context) {
    return RetryLaneAction.create({
      ownerSource: this,
      context: Object.assign({
        workflow: this.getWorkflowProxy(),
        retryLaneCallback: (...args) => this.get('retryLaneCallback')(...args),
      }, context),
    });
  },

  /**
   * @param {Utils.WorkflowVisualiser.Lane} context.lane
   * @param {AtmLaneRunNumber} context.runNumber
   * @returns {Utils.WorkflowVisualiser.Actions.RerunLaneAction}
   */
  createRerunLaneAction(context) {
    return RerunLaneAction.create({
      ownerSource: this,
      context: Object.assign({
        workflow: this.getWorkflowProxy(),
        rerunLaneCallback: (...args) => this.get('rerunLaneCallback')(...args),
      }, context),
    });
  },

  createViewTaskPodsActivityAction(context) {
    return ViewTaskPodsActivityAction.create({
      ownerSource: this,
      context: Object.assign({
        showPodsActivityCallback: (...args) => this.get('showTaskPodsActivityCallback')(...args),
      }, context),
    });
  },

  /**
   * @private
   * @returns {ArrayProxy<Utils.WorkflowVisualiser.Store>}
   */
  getDefinedStoresArrayProxy() {
    return ArrayProxy
      .extend({ content: reads('factory.workflowDataProvider.definedStores') })
      .create({ factory: this });
  },

  /**
   * @private
   * @returns {ObjectProxy<Utils.WorkflowVisualiser.Workflow>}
   */
  getWorkflowProxy() {
    return ObjectProxy
      .extend({ content: reads('factory.workflowDataProvider.workflow') })
      .create({ factory: this });
  },
});
