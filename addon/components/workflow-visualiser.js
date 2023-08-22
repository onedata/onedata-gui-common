/**
 * Is responsible for showing and editing workflows.
 *
 * Workflow is a description of some ordered collection of files tasks. Order of the
 * execution is described by lanes and parallel boxes - both of them are responsible for
 * grouping tasks. Execution goes as follows:
 * 1. Tasks are being executed lane-by-lane. Next lane is started only when the previous
 * lane was completely done for all files.
 * 2. Tasks inside each lane are grouped by parallel boxes. All tasks inside the same
 * parallel box can be executed in the same time and file.
 * 3. Each file can be processed only in one parallel box at a time. When some file was
 * processed by all tasks in some parallel box, then it can be processed by the tasks
 * inside the next parallel box. Files do not wait for each other during the parallel
 * boxes execution - files have separated box-by-box execution.
 *
 * Model, which compounds of workflow data and action callbacks, describes each
 * workflow element and space between them (for drag&drop and creating new elements).
 * Each model element (lane, task, etc.) is passed to the dedicated component (usually
 * with the corresponding name). Nested components interact with the main
 * workflow-visualiser component only via actions in model. Also all data needed
 * by the component to render is available in passed model object.
 *
 * Model inheritance:
 *
 *                                  +--------------------+
 *                                  | Visualiser element |
 *                                  +----------^---------+
 *                                             |
 *                      +----------------------+--------------------+
 *                      |                                           |
 *            +---------+---------+                        +--------+---------+
 *            | Visualiser record |                        | Visualiser space |
 *            +---------^---------+                        +--------^---------+
 *                      |                                           |
 *     +----------------+--------------+                +-----------+----------+
 *     |                |              |                |                      |
 *  +--+---+    +-------+------+    +--+---+   +--------+--------+   +---------+--------+
 *  | Lane |    | Parallel box |    | Task |   | Interlane space |   | Interblock space |
 *  +------+    +--------------+    +------+   +-----------------+   +------------------+
 *
 * Model composition:
 *
 *                                  +-------------------+
 *                                  | visualierElements | (simple array)
 *                                  +---------+---------+
 *                                            |1
 *                                  +---------+--------+
 *                                  |n                 |n+1
 *                              +---v--+     +---------v-------+
 *                              | Lane |     | Interlane space |
 *                              +---+--+     +-----------------+
 *                                  |1
 *                       +----------+------------+
 *                       |m                      |m+1
 *               +-------v------+      +---------v--------+
 *               | Parallel box |      | Interblock space |
 *               +-------+------+      +------------------+
 *                       |
 *            +----------+------+
 *            |p                |p+1
 *        +---v--+    +---------v--------+
 *        | Task |    | Interblock space |
 *        +------+    +------------------+
 *
 * Components inheritance and composition is very similar. Exception: there is no specific
 * component for VisualiserRecord.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from 'onedata-gui-common/templates/components/workflow-visualiser';
import {
  computed,
  observer,
  get,
  getProperties,
  set,
  setProperties,
} from '@ember/object';
import ActionsFactory from 'onedata-gui-common/utils/workflow-visualiser/actions-factory';
import WorkflowDataProvider from 'onedata-gui-common/utils/workflow-visualiser/workflow-data-provider';
import Lane from 'onedata-gui-common/utils/workflow-visualiser/lane';
import InterlaneSpace from 'onedata-gui-common/utils/workflow-visualiser/interlane-space';
import ParallelBox from 'onedata-gui-common/utils/workflow-visualiser/lane/parallel-box';
import Task from 'onedata-gui-common/utils/workflow-visualiser/lane/task';
import InterblockSpace from 'onedata-gui-common/utils/workflow-visualiser/lane/interblock-space';
import Store from 'onedata-gui-common/utils/workflow-visualiser/store';
import Workflow from 'onedata-gui-common/utils/workflow-visualiser/workflow';
import generateId from 'onedata-gui-common/utils/generate-id';
import { resolve, Promise } from 'rsvp';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import _ from 'lodash';
import { inject as service } from '@ember/service';
import {
  conditional,
  raw,
  tag,
  string,
  promise,
  array,
} from 'ember-awesome-macros';
import config from 'ember-get-config';
import WindowResizeHandler from 'onedata-gui-common/mixins/components/window-resize-handler';
import { scheduleOnce, run } from '@ember/runloop';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import Looper from 'onedata-gui-common/utils/looper';
import {
  translateWorkflowStatus,
  workflowEndedStatuses,
  workflowSuspendedStatuses,
  taskEndedStatuses,
  taskSuspendedStatuses,
} from 'onedata-gui-common/utils/workflow-visualiser/statuses';
import { runsRegistryToSortedArray } from 'onedata-gui-common/utils/workflow-visualiser/run-utils';
import { typeOf } from '@ember/utils';
import dom from 'onedata-gui-common/utils/dom';
import validateAtmWorkflowSchemaRevision from 'onedata-gui-common/utils/atm-workflow/validate-atm-workflow-schema-revision';

const nonActiveTaskStatuses = [
  ...taskEndedStatuses,
  ...taskSuspendedStatuses,
];
const isInTestingEnv = config.environment === 'test';
const windowResizeDebounceTime = isInTestingEnv ? 0 : 30;
const statsUpdateInterval = 3000;

export default Component.extend(I18n, WindowResizeHandler, {
  layout,
  classNames: ['workflow-visualiser'],
  classNameBindings: [
    'modeClass',
    'statusClass',
    'duringDragDropClass',
  ],

  i18n: service(),
  dragDrop: service(),
  clipboardActions: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.workflowVisualiser',

  /**
   * @override
   */
  callWindowResizeHandlerOnInsert: false,

  /**
   * @override
   */
  windowResizeDebounceTime,

  /**
   * ```
   * {
   *   lanes: Array<Object>,
   *   stores: Array<Object>,
   * }
   * ```
   * @virtual
   * @type {Object}
   */
  rawData: undefined,

  /**
   * One of: 'edit', 'view'
   * @virtual
   * @type {String}
   */
  mode: 'edit',

  /**
   * @virtual optional
   * @type {Object<string,(Models.AtmLambda|Models.AtmLambdaSnapshot)>}
   */
  usedLambdasMap: undefined,

  /**
   * @virtual optional
   * @type {(rawDataDump: Object, validationErrors: Array<AtmWorkflowSchemaValidationError>) => Promise<void>}
   * @returns {Promise}
   */
  onChange: undefined,

  /**
   * @virtual optional
   * @type {Utils.WorkflowVisualiser.ActionsFactory}
   */
  actionsFactory: undefined,

  /**
   * @virtual optional
   * @type {Utils.WorkflowVisualiser.ExecutionDataFetcher}
   */
  executionDataFetcher: undefined,

  /**
   * @virtual optional
   * @type {Utils.Action}
   */
  pauseResumeExecutionAction: undefined,

  /**
   * @virtual optional
   * @type {Utils.Action}
   */
  cancelExecutionAction: undefined,

  /**
   * @virtual optional
   * @type {Utils.Action}
   */
  forceContinueExecutionAction: undefined,

  /**
   * @virtual optional
   * @type {Utils.Action}
   */
  removeExecutionAction: undefined,

  /**
   * @type {Utils.Looper}
   */
  executionStateUpdater: undefined,

  /**
   * Contains model objects which were created during the workflow editor
   * lifetime. Is used to build new model structure from existing entries on
   * data update, which prevents from unnecessary rerendering.
   * ```
   * {
   *   lane: Array<Utils.WorkflowVisualiser.VisualiserElement>,
   *   interlaneSpace: Array<Utils.WorkflowVisualiser.InterlaneSpace>,
   *   parallelBox: Array<Utils.WorkflowVisualiser.Lane.ParallelBox>,
   *   task: Array<Utils.WorkflowVisualiser.Lane.Task>,
   *   interblockSpace: Array<Utils.WorkflowVisualiser.Lane.InterblockSpace>,
   *   store: Array<Utils.WorkflowVisualiser.Store>,
   *   workflow: Array<Utils.WorkflowVisualiser.Workflow>,
   * }
   * ```
   * @type {Object}
   */
  elementsCache: undefined,

  /**
   * Index of the lane, to which the visualiser will scroll on `scrollLeft` action.
   * Null when left scroll should be blocked.
   * @type {Number|null}
   */
  laneIdxForNextLeftScroll: null,

  /**
   * Index of the lane, to which the visualiser will scroll on `scrollRight` action.
   * Null when right scroll should be blocked
   * @type {Number|null}
   */
  laneIdxForNextRightScroll: null,

  /**
   * Format of this object is defined by return type of
   * ExecutionDataFetcher.fetchExecutionState function.
   * @type {AtmExecutionState}
   */
  executionState: undefined,

  /**
   * @type {ComputedProperty<Array<AtmWorkflowSchemaValidationError>>}
   */
  validationErrors: computed('rawData', function validationErrors() {
    return validateAtmWorkflowSchemaRevision(this.i18n, this.rawData);
  }),

  /**
   * @type {ComputedProperty<Utils.WorkflowVisualiser.Workflow>}
   */
  workflow: computed('rawData', 'executionState', function workflow() {
    return this.getWorkflow();
  }),

  /**
   * @type {ComputedProperty<Array<Utils.WorkflowVisualiser.VisualiserElement>>}
   */
  visualiserElements: computed(
    'rawData',
    'executionState',
    'usedLambdasMap',
    function visualiserElements() {
      return this.getVisualiserElements();
    }
  ),

  /**
   * @type {ComputedProperty<Array<Utils.WorkflowVisualiser.Store>>}
   */
  definedStores: computed('rawData', 'executionState', function definedStores() {
    return this.getDefinedStores();
  }),

  /**
   * NOTE: Generated stores, unlike to defined ones, don't function as
   * standalone entities. These are rather stores created on-demand, owned
   * by models which need them. Also the lifecycle of the generated store is
   * tightly coupled with its parent. Example: audit log or time series a of task.
   * Some store state properties (like `contentMayChange` value) are determined
   * by the state of the parent model.
   * @type {ComputedProperty<Array<Utils.WorkflowVisualiser.Store>>}
   */
  generatedStores: computed('executionState', function generatedStores() {
    return this.getGeneratedStores();
  }),

  /**
   * @type {ComputedProperty<Array<Utils.WorkflowVisualiser.Store>>}
   */
  stores: array.concat('definedStores', 'generatedStores'),

  /**
   * @type {ComputedProperty<String>}
   */
  modeClass: tag `mode-${'mode'}`,

  /**
   * @type {ComputedProperty<String>}
   */
  statusClass: tag `status-${'workflow.status'}`,

  /**
   * @type {ComputedProperty<String>}
   */
  statusTranslation: computed('workflow.status', function statusTranslation() {
    return translateWorkflowStatus(
      this.get('i18n'),
      this.get('workflow.status')
    );
  }),

  /**
   * @type {ComputedProperty<String|undefined>}
   */
  typeOfDraggedElementModel: computed(
    'dragDrop.draggedElementModel.type',
    function typeOfDraggedElementModel() {
      const draggedElementModel = this.get('dragDrop.draggedElementModel');
      if (draggedElementModel) {
        const {
          __modelOrigin,
          __modelType,
        } = getProperties(draggedElementModel, '__modelOrigin', '__modelType');
        return __modelOrigin === 'workflowVisualiser' ? __modelType : undefined;
      }
    }
  ),

  /**
   * @type {ComputedProperty<String>}
   */
  duringDragDropClass: conditional(
    'typeOfDraggedElementModel',
    // eslint-disable-next-line ember/no-string-prototype-extensions
    tag `during-${string.dasherize('typeOfDraggedElementModel')}-dragdrop`,
    raw('')
  ),

  /**
   * @type {ComputedProperty<PromiseObject>}
   */
  initialLoadingProxy: promise.object(computed(async function initialLoading() {
    if (this.get('mode') === 'view') {
      return this.updateExecutionState();
    }
  })),

  /**
   * @type {ComputedProperty<Function>}
   */
  lifecycleChangingActionHook: computed(function lifecycleChangingActionHook() {
    return async (result, action) => {
      if (result?.status !== 'done' || action === this.removeExecutionAction) {
        return;
      }
      try {
        await this.updateExecutionState();
      } catch (error) {
        console.error('Cannot update workflow status after action:', error);
      }
    };
  }),

  /**
   * @type {ComputedProperty<Utils.Action>}
   */
  copyInstanceIdAction: computed(
    'workflow.instanceId',
    function copyInstanceIdAction() {
      const {
        workflow,
        clipboardActions,
      } = this.getProperties('workflow', 'clipboardActions');
      return clipboardActions.createCopyRecordIdAction({
        record: { id: get(workflow, 'instanceId') },
      });
    }
  ),

  /**
   * @type {ComputedProperty<Utils.Action>}
   */
  viewAuditLogAction: computed('actionsFactory', function viewAuditLogAction() {
    return this.get('actionsFactory').createViewWorkflowAuditLogAction();
  }),

  /**
   * @type {ComputedProperty<Utils.Action>}
   */
  openWorkflowChartsDashboardAction: computed(
    'mode',
    function openWorkflowChartsDashboardAction() {
      if (this.mode === 'view') {
        return this.actionsFactory.createViewWorkflowChartsDashboardAction();
      } else {
        return this.actionsFactory.createModifyWorkflowChartsDashboardAction();
      }
    }
  ),

  /**
   * @type {ComputedProperty<Array<Utils.Action>>}
   */
  executionActions: computed(
    'isExecutionEnded',
    'isExecutionSuspended',
    'copyInstanceIdAction',
    'viewAuditLogAction',
    'lifecycleChangingActionHook',
    'pauseResumeExecutionAction',
    'cancelExecutionAction',
    'forceContinueExecutionAction',
    'removeExecutionAction',
    function executionActions() {
      const actions = [this.copyInstanceIdAction, this.viewAuditLogAction];

      if (!this.isExecutionEnded) {
        const pauseResumeExecutionAction =
          this.normalizeLifecycleChangingAction(this.pauseResumeExecutionAction);
        if (pauseResumeExecutionAction) {
          actions.push(pauseResumeExecutionAction);
        }

        const cancelExecutionAction =
          this.normalizeLifecycleChangingAction(this.cancelExecutionAction);
        if (cancelExecutionAction) {
          actions.push(cancelExecutionAction);
        }
      }
      if (this.executionState?.workflow?.status === 'failed') {
        const forceContinueExecutionAction =
          this.normalizeLifecycleChangingAction(this.forceContinueExecutionAction);
        if (forceContinueExecutionAction) {
          actions.push(forceContinueExecutionAction);
        }
      }
      if (this.isExecutionEnded || this.isExecutionSuspended) {
        const removeExecutionAction =
          this.normalizeLifecycleChangingAction(this.removeExecutionAction);
        if (removeExecutionAction) {
          actions.push(removeExecutionAction);
        }
      }

      return actions;
    }
  ),

  /**
   * @type {ComputedProperty<boolean>}
   */
  isExecutionSuspended: computed(
    'executionState.workflow.status',
    function isExecutionSuspended() {
      return workflowSuspendedStatuses.includes(
        this.executionState?.workflow?.status
      );
    }
  ),

  /**
   * @type {ComputedProperty<boolean>}
   */
  isExecutionEnded: computed(
    'executionState.workflow.status',
    function isExecutionSuspended() {
      return workflowEndedStatuses.includes(
        this.executionState?.workflow?.status
      );
    }
  ),

  actionsFactoryObserver: observer(
    'actionsFactory',
    function actionsFactoryObserver() {
      const actionsFactory = this.get('actionsFactory');
      if (actionsFactory) {
        this.adaptActionsFactory(actionsFactory);
      }
    }
  ),

  /**
   * @override
   */
  init() {
    this._super(...arguments);

    this.set('elementsCache', {
      lane: [],
      interlaneSpace: [],
      parallelBox: [],
      task: [],
      interblockSpace: [],
      store: [],
      workflow: [],
    });

    if (!this.get('actionsFactory')) {
      this.set('actionsFactory', ActionsFactory.create({ ownerSource: this }));
    }
    this.actionsFactoryObserver();
    if (this.get('mode') === 'view') {
      this.get('initialLoadingProxy')
        .then(() => safeExec(this, 'setupExecutionStateUpdater'));
    }
  },

  /**
   * @override
   */
  didRender() {
    this.scheduleHorizontalOverflowDetection();
  },

  /**
   * @override
   */
  willDestroyElement() {
    try {
      this.stopExecutionStateUpdater();
    } finally {
      this._super(...arguments);
    }
  },

  /**
   * @override
   */
  onWindowResize() {
    run(() => this.scheduleHorizontalOverflowDetection());
  },

  setupExecutionStateUpdater() {
    if (this.get('executionStateUpdater')) {
      return;
    }

    const executionStateUpdater = Looper.create({
      immediate: false,
      interval: statsUpdateInterval,
    });
    executionStateUpdater.on('tick', () => this.updateExecutionState());
    this.set('executionStateUpdater', executionStateUpdater);
  },

  stopExecutionStateUpdater() {
    const executionStateUpdater = this.get('executionStateUpdater');
    if (executionStateUpdater) {
      safeExec(executionStateUpdater, () => executionStateUpdater.destroy());
    }
  },

  adaptActionsFactory(actionsFactory) {
    actionsFactory.setWorkflowDataProvider(
      WorkflowDataProvider.create({ visualiserComponent: this })
    );
    actionsFactory.setCreateStoreCallback(
      newStoreProps => this.addStore(newStoreProps)
    );
  },

  scheduleHorizontalOverflowDetection() {
    scheduleOnce('afterRender', this, 'detectHorizontalOverflow');
  },

  detectHorizontalOverflow() {
    // Scrolling is not pixel-perfect. Without that epsilon test cases break down.
    const checksPxEpsilon = 1;

    const lanesContainer = this.element?.querySelector('.visualiser-elements');
    if (!lanesContainer) {
      return;
    }
    const viewOffset = dom.offset(lanesContainer).left;
    const viewWidth = dom.width(lanesContainer);

    const lanes = [...this.element.querySelectorAll('.workflow-visualiser-lane')];
    const lanesOffset = lanes.map((lane) => dom.offset(lane).left);
    const lanesWidth = lanes.map((lane) => dom.width(lane));

    let laneIdxForNextLeftScroll = null;
    for (let i = 0; i < lanes.length; i++) {
      if (viewOffset - lanesOffset[i] <= checksPxEpsilon) {
        break;
      }
      laneIdxForNextLeftScroll = i;
    }

    let laneIdxForNextRightScroll = null;
    for (let i = lanes.length - 1; i >= 0; i--) {
      if (lanesOffset[i] + lanesWidth[i] - (viewOffset + viewWidth) <= checksPxEpsilon) {
        break;
      }
      laneIdxForNextRightScroll = i;
    }

    this.setProperties({
      laneIdxForNextLeftScroll,
      laneIdxForNextRightScroll,
    });
  },

  /**
   * @param {number} laneIdx
   * @param {String} edge 'left' or 'right'
   */
  scrollToLane(laneIdx, edge) {
    if (laneIdx === null) {
      return;
    }

    const lanesContainer = this.element.querySelector('.visualiser-elements');
    if (!lanesContainer) {
      return;
    }
    const viewOffset = dom.offset(lanesContainer).left;
    const viewWidth = dom.width(lanesContainer);
    const viewScroll = lanesContainer.scrollLeft;

    const lanes = [...this.element.querySelectorAll('.workflow-visualiser-lane')];

    let scrollPosition;
    if (laneIdx <= 0) {
      scrollPosition = 0;
    } else if (laneIdx >= lanes.length - 1) {
      scrollPosition = lanesContainer.scrollWidth;
    } else {
      const targetLane = lanes[laneIdx];
      const targetLaneOffset = dom.offset(targetLane).left;
      const targetLaneWidth = dom.width(targetLane);
      let pxToScroll;
      if (edge === 'left') {
        pxToScroll = targetLaneOffset - viewOffset;
      } else {
        pxToScroll = targetLaneOffset + targetLaneWidth - (viewOffset + viewWidth);
      }
      scrollPosition = viewScroll + pxToScroll;
    }

    lanesContainer.scroll({
      left: scrollPosition,
      behavior: isInTestingEnv ? 'auto' : 'smooth',
    });

    // `scrollToLane` should trigger scroll event, so
    // `scheduleHorizontalOverflowDetection` would be called without the line below.
    // But sometimes scroll event is not triggered at all (scrollbar bug?) and we need
    // to kick the detection manually.
    this.scheduleHorizontalOverflowDetection();
  },

  /**
   * Generates an object, which describes a workflow as a whole
   * @returns {Utils.WorkflowVisualiser.Workflow}
   */
  getWorkflow() {
    const {
      instanceId,
      status,
      systemAuditLogStoreInstanceId,
    } = getProperties(
      this.get('executionState.workflow') || {},
      'instanceId',
      'status',
      'systemAuditLogStoreInstanceId',
    );
    const systemAuditLogStore = systemAuditLogStoreInstanceId &&
      this.getStoreByInstanceId(systemAuditLogStoreInstanceId);
    if (systemAuditLogStore) {
      // Updating generated store state. See more in `generatedStores` field docs
      set(
        systemAuditLogStore,
        'contentMayChange',
        !this.isExecutionEnded && !this.isExecutionSuspended
      );
    }

    const existingWorkflow = this.getCachedElement('workflow');

    if (existingWorkflow) {
      this.updateElement(existingWorkflow, {
        instanceId,
        systemAuditLogStore,
        status,
        dashboardSpec: this.rawData?.dashboardSpec ?? null,
      });
      return existingWorkflow;
    } else {
      const newWorkflow = Workflow.create({
        instanceId,
        systemAuditLogStore,
        status,
        dashboardSpec: this.rawData?.dashboardSpec ?? null,
        onModify: (workflow, modifiedProps) =>
          this.modifyElement(workflow, modifiedProps),
      });
      this.addElementToCache('workflow', newWorkflow);

      return newWorkflow;
    }
  },

  /**
   * Generates an array of defined stores from `rawData`
   * @returns {Array<Utils.WorkflowVisualiser.Store>}
   */
  getDefinedStores() {
    const rawStores = this.get('rawData.stores') || [];
    return rawStores.map(rawStore => {
      const store = this.getElementForRawData('store', rawStore);
      store.clearReferencingRecords();
      return store;
    });
  },

  /**
   * Generates an array of generated stores from `executionState`
   * @returns {Array<Utils.WorkflowVisualiser.Store>}
   */
  getGeneratedStores() {
    const rawGeneratedStoresRegistry = this.get('executionState.store.generated') || {};
    return Object.values(rawGeneratedStoresRegistry)
      .map(rawStore => this.getElementForRawData('store', rawStore));
  },

  /**
   * Generates an array of lanes and interlane spaces from `rawData`
   * @returns {Array<Utils.WorkflowVisualiser.Lane|Utils.WorkflowVisualiser.InterlaneSpace>}
   */
  getVisualiserElements() {
    const rawLanes = this.get('rawData.lanes') || [];
    const lanes = rawLanes.map(rawLane => this.getElementForRawData('lane', rawLane));
    this.updatePositionInfoForCollection(lanes);

    const visualiserElements = [
      this.getInterelementSpaceFor(null, lanes[0] || null, null),
    ];
    for (let i = 0; i < lanes.length; i++) {
      const lane = lanes[i];
      const nextLane = lanes[i + 1] || null;
      visualiserElements.push(
        lane,
        this.getInterelementSpaceFor(lane, nextLane, null)
      );
    }

    return visualiserElements;
  },

  /**
   * Returns visualiser element for given raw data.
   * @param {Object} rawData element representation from backend
   * @param {Utils.WorkflowVisualiser.Lane|Utils.WorkflowVisualiser.Lane.ParallelBox} [parent=null]
   * @returns {Utils.WorkflowVisualiser.VisualiserRecord}
   */
  getElementForRawData(type, rawData, parent = null) {
    switch (type) {
      case 'lane':
        // Lane does not have any parent
        return this.getLaneForRawData(rawData);
      case 'parallelBox':
        return this.getParallelBoxForRawData(rawData, parent);
      case 'task':
        return this.getTaskForRawData(rawData, parent);
      case 'store':
        return this.getStoreForRawData(rawData);
      default:
        return undefined;
    }
  },

  /**
   * Sets correct values of `positionInParent`, `isFirst` and `isLast` properties in
   * elements of passed collection.
   * @param {Array<Utils.WorkflowVisualiser.VisualiserElement>} collection
   */
  updatePositionInfoForCollection(collection) {
    for (let i = 0; i < collection.length; i++) {
      const item = collection[i];

      if (item.positionInParent !== i + 1) {
        set(item, 'positionInParent', i + 1);
      }
      if (i === 0 && !item.isFirst) {
        set(item, 'isFirst', true);
      } else if (i !== 0 && item.isFirst) {
        set(item, 'isFirst', false);
      }
      if (i === collection.length - 1 && !item.isLast) {
        set(item, 'isLast', true);
      } else if (i !== collection.length - 1 && item.isLast) {
        set(item, 'isLast', false);
      }
    }
  },

  /**
   * Returns lane element for given raw data. If it is available in cache,
   * then it is updated. Otherwise it is created from scratch and saved in cache for
   * future updates.
   * @param {Object} laneRawData lane representation from backend
   * @returns {Utils.WorkflowVisualiser.Lane}
   */
  getLaneForRawData(laneRawData) {
    const {
      id,
      name,
      maxRetries,
      instantFailureExceptionThreshold,
      storeIteratorSpec,
      parallelBoxes: rawParallelBoxes,
      dashboardSpec,
    } = getProperties(
      laneRawData,
      'id',
      'name',
      'maxRetries',
      'instantFailureExceptionThreshold',
      'storeIteratorSpec',
      'parallelBoxes',
      'dashboardSpec'
    );
    const iteratedStoreSchemaId = get(storeIteratorSpec || {}, 'storeSchemaId');
    const normalizedRunsRegistry = {};
    const runsRegistry = this.get(`executionState.lane.${id}.runsRegistry`) || {};
    const sortedRuns = runsRegistryToSortedArray(runsRegistry);
    let newestRunNumber;
    if (sortedRuns.length) {
      sortedRuns.forEach((run) => {
        const runNumber = run.runNumber;
        const iteratedStoreInstanceId = runsRegistry[runNumber].iteratedStoreInstanceId;
        const exceptionStoreInstanceId = runsRegistry[runNumber].exceptionStoreInstanceId;
        const iteratedStore = iteratedStoreInstanceId ?
          this.getStoreByInstanceId(iteratedStoreInstanceId) :
          this.getStoreBySchemaId(iteratedStoreSchemaId);
        const exceptionStore = exceptionStoreInstanceId &&
          this.getStoreByInstanceId(exceptionStoreInstanceId);
        normalizedRunsRegistry[runNumber] = Object.assign({}, run, {
          iteratedStore,
          exceptionStore,
        });
      });
      newestRunNumber = sortedRuns[sortedRuns.length - 1].runNumber;
    } else {
      normalizedRunsRegistry[1] = {
        runNumber: 1,
        status: 'pending',
        iteratedStore: iteratedStoreSchemaId ?
          this.getStoreBySchemaId(iteratedStoreSchemaId) : null,
      };
      newestRunNumber = 1;
    }
    const validationErrors =
      this.validationErrors.filter(({ elementId }) => elementId === id);

    let lane = this.getCachedElement('lane', { id });

    if (lane) {
      const {
        runsRegistry: prevRunsRegistry,
        visibleRunNumber: prevVisibleRunNumber,
        visibleRunsPosition: prevVisibleRunsPosition,
      } = getProperties(
        lane,
        'runsRegistry',
        'visibleRunNumber',
        'visibleRunsPosition'
      );
      const prevDescSortedRunNumbers =
        runsRegistryToSortedArray(prevRunsRegistry).mapBy('runNumber').reverse();
      let visibleRunNumber = prevVisibleRunNumber;
      let visibleRunsPosition = prevVisibleRunsPosition;
      if (
        prevDescSortedRunNumbers.indexOf(prevVisibleRunNumber) === 0 &&
        prevVisibleRunNumber !== newestRunNumber
      ) {
        visibleRunNumber = newestRunNumber;
        if (
          visibleRunsPosition.runNumber === prevVisibleRunNumber &&
          visibleRunsPosition.placement === 'end'
        ) {
          visibleRunsPosition = {
            runNumber: newestRunNumber,
            placement: 'end',
          };
        }
      }
      this.updateElement(lane, {
        name,
        maxRetries,
        instantFailureExceptionThreshold,
        storeIteratorSpec,
        dashboardSpec,
        runsRegistry: normalizedRunsRegistry,
        visibleRunNumber,
        visibleRunsPosition,
        validationErrors,
      });
      const elements = this.getLaneElementsForRawData(
        'parallelBox',
        rawParallelBoxes,
        lane
      );
      this.updateElement(lane, { elements });
    } else {
      const {
        mode,
        actionsFactory,
      } = this.getProperties('mode', 'actionsFactory');

      lane = Lane.create({
        id,
        schemaId: id,
        name,
        maxRetries,
        instantFailureExceptionThreshold,
        storeIteratorSpec,
        dashboardSpec,
        runsRegistry: normalizedRunsRegistry,
        visibleRunNumber: newestRunNumber,
        visibleRunsPosition: {
          runNumber: newestRunNumber,
          placement: 'end',
        },
        validationErrors,
        mode,
        actionsFactory,
        onModify: (lane, modifiedProps) => this.modifyElement(lane, modifiedProps),
        onMove: (lane, moveStep) => this.moveElement(lane, moveStep),
        onClear: lane => this.clearLane(lane),
        onRemove: lane => this.removeElement(lane),
        onChangeRun: (lane, runNumber) => this.changeLaneRun(lane, runNumber),
        onShowLatestRun: (lane) => this.showLatestLaneRun(lane),
      });
      set(
        lane,
        'elements',
        this.getLaneElementsForRawData('parallelBox', rawParallelBoxes, lane)
      );
      this.addElementToCache('lane', lane);
    }

    const usedStoreSchemaIds = lane.getUsedStoreSchemaIds();
    const usedStores = usedStoreSchemaIds
      .map((storeSchemaId) => this.getStoreBySchemaId(storeSchemaId))
      .filter(Boolean);
    usedStores.forEach((store) => store.registerReferencingRecord(lane));

    return lane;
  },

  /**
   * Returns array of lane elements for given raw data. Handles two types of
   * collections:
   * - list of parallel boxes in a lane,
   * - list of tasks in a parallel box.
   * If the result array has the same elements as were in the existing array in `parent`,
   * then the existing array is returned (the same reference is preserved).
   * @param {Array<Object>} elementsRawData array of task/parallel box backend representations
   * @param {Utils.WorkflowVisualiser.Lane|Utils.WorkflowVisualiser.Lane.ParallelBox} parent
   * @returns {Array<Utils.WorkflowVisualiser.VisualiserElement>}
   */
  getLaneElementsForRawData(elementType, elementsRawData, parent) {
    const existingLaneElements = get(parent || {}, 'elements') || [];
    const elementsForRawData = (elementsRawData || []).map(elementRawData =>
      this.getElementForRawData(elementType, elementRawData, parent)
    );
    this.updatePositionInfoForCollection(elementsForRawData);

    const newLaneElements = [
      this.getInterelementSpaceFor(null, elementsForRawData[0] || null, parent),
    ];

    for (let i = 0; i < elementsForRawData.length; i++) {
      const element = elementsForRawData[i];
      const nextElement = elementsForRawData[i + 1] || null;
      newLaneElements.push(
        element,
        this.getInterelementSpaceFor(element, nextElement, parent)
      );
    }

    const elementsArrayHasChanged = !existingLaneElements ||
      newLaneElements.some((element, idx) => existingLaneElements[idx] !== element);

    return elementsArrayHasChanged ? newLaneElements : existingLaneElements;
  },

  /**
   * Returns parallel box element for given raw data. If it is available in cache,
   * then it is updated. Otherwise it is created from scratch and saved in cache for
   * future updates.
   * @param {Object} parallelBoxRawData parallel box representation from backend
   * @param {Utils.WorkflowVisualiser.Lane} parent
   * @returns {Utils.WorkflowVisualiser.Lane.ParallelBox}
   */
  getParallelBoxForRawData(parallelBoxRawData, parent) {
    const {
      id,
      name,
      tasks: rawTasks,
    } = getProperties(parallelBoxRawData, 'id', 'name', 'tasks');

    const parentRunNumbers = Object.values(get(parent, 'runsRegistry')).mapBy('runNumber');
    const normalizedRunsRegistry = Object.assign({},
      this.get(`executionState.parallelBox.${id}.runsRegistry`) || {}
    );
    parentRunNumbers.forEach((parentRunNumber) => {
      if (!(parentRunNumber in normalizedRunsRegistry)) {
        normalizedRunsRegistry[parentRunNumber] = {
          runNumber: parentRunNumber,
          status: 'pending',
        };
      }
    });

    const existingParallelBox = this.getCachedElement('parallelBox', { id });
    if (existingParallelBox) {
      this.updateElement(existingParallelBox, {
        name,
        parent,
        runsRegistry: normalizedRunsRegistry,
      });
      const elements = this.getLaneElementsForRawData(
        'task',
        rawTasks,
        existingParallelBox
      );
      this.updateElement(existingParallelBox, { elements });
      return existingParallelBox;
    } else {
      const {
        mode,
        actionsFactory,
      } = this.getProperties('mode', 'actionsFactory');

      const newParallelBox = ParallelBox.create({
        id,
        schemaId: id,
        name,
        parent,
        runsRegistry: normalizedRunsRegistry,
        mode,
        actionsFactory,
        onModify: (box, modifiedProps) => this.modifyElement(box, modifiedProps),
        onMove: (box, moveStep) => this.moveElement(box, moveStep),
        onRemove: box => this.removeElement(box),
      });
      set(
        newParallelBox,
        'elements',
        this.getLaneElementsForRawData('task', rawTasks, newParallelBox)
      );
      this.addElementToCache('parallelBox', newParallelBox);

      return newParallelBox;
    }
  },

  /**
   * Returns task element for given raw data. If it is available in cache, then it
   * is updated. Otherwise it is created from scratch and saved in cache for future updates.
   * @param {Object} taskRawData task representation from backend
   * @param {Utils.WorkflowVisualiser.Lane.ParallelBox} parent
   * @returns {Utils.WorkflowVisualiser.Lane.Task}
   */
  getTaskForRawData(taskRawData, parent) {
    const {
      id,
      name,
      lambdaId,
      lambdaRevisionNumber,
      lambdaConfig,
      argumentMappings,
      resultMappings,
      timeSeriesStoreConfig,
      resourceSpecOverride,
    } = getProperties(
      taskRawData,
      'id',
      'name',
      'lambdaId',
      'lambdaRevisionNumber',
      'lambdaConfig',
      'argumentMappings',
      'resultMappings',
      'timeSeriesStoreConfig',
      'resourceSpecOverride'
    );

    const parentRunNumbers = Object.values(get(parent, 'runsRegistry')).mapBy('runNumber');
    const normalizedRunsRegistry = {};
    const runsRegistry = this.get(`executionState.task.${id}.runsRegistry`) || {};
    Object.values(runsRegistry).forEach(({ runNumber }) => {
      const systemAuditLogStoreInstanceId =
        runsRegistry[runNumber].systemAuditLogStoreInstanceId;
      const timeSeriesStoreInstanceId =
        runsRegistry[runNumber].timeSeriesStoreInstanceId;
      normalizedRunsRegistry[runNumber] = Object.assign({}, runsRegistry[runNumber], {
        systemAuditLogStore: this.getStoreByInstanceId(systemAuditLogStoreInstanceId),
        timeSeriesStore: this.getStoreByInstanceId(timeSeriesStoreInstanceId),
      });
      ['systemAuditLogStore', 'timeSeriesStore'].forEach((taskStoreName) => {
        if (normalizedRunsRegistry[runNumber][taskStoreName]) {
          // Updating generated stores state. See more in `generatedStores` field docs
          set(
            normalizedRunsRegistry[runNumber][taskStoreName],
            'contentMayChange',
            !nonActiveTaskStatuses.includes(normalizedRunsRegistry[runNumber].status)
          );
        }
      });
    });
    parentRunNumbers.forEach((parentRunNumber) => {
      if (!(parentRunNumber in normalizedRunsRegistry)) {
        normalizedRunsRegistry[parentRunNumber] = {
          runNumber: parentRunNumber,
          instanceId: null,
          status: 'pending',
          systemAuditLogStore: null,
          timeSeriesStore: null,
          itemsInProcessing: 0,
          itemsProcessed: 0,
          itemsFailed: 0,
        };
      }
    });

    const usedLambdasMap = this.get('usedLambdasMap') || {};
    const lambda = usedLambdasMap[lambdaId];
    const validationErrors =
      this.validationErrors.filter(({ elementId }) => elementId === id);

    let task = this.getCachedElement('task', { id });

    if (task) {
      this.updateElement(task, {
        runsRegistry: normalizedRunsRegistry,
        name,
        parent,
        lambdaId,
        lambda,
        lambdaRevisionNumber,
        lambdaConfig,
        argumentMappings,
        resultMappings,
        timeSeriesStoreConfig,
        resourceSpecOverride,
        validationErrors,
      });
    } else {
      const {
        mode,
        actionsFactory,
      } = this.getProperties('mode', 'actionsFactory');

      task = Task.create({
        id,
        schemaId: id,
        runsRegistry: normalizedRunsRegistry,
        name,
        parent,
        lambdaId,
        lambda,
        lambdaRevisionNumber,
        mode,
        actionsFactory,
        lambdaConfig,
        argumentMappings,
        resultMappings,
        timeSeriesStoreConfig,
        resourceSpecOverride,
        validationErrors,
        onModify: (task, modifiedProps) => this.modifyElement(task, modifiedProps),
        onRemove: task => this.removeElement(task),
      });
      this.addElementToCache('task', task);
    }

    const usedStoreSchemaIds = task.getUsedStoreSchemaIds();
    const usedStores = usedStoreSchemaIds
      .map((storeSchemaId) => this.getStoreBySchemaId(storeSchemaId))
      .filter(Boolean);
    usedStores.forEach((store) => store.registerReferencingRecord(task));

    return task;
  },

  /**
   * Generates (or returns from cache if already exists) an interX space for given
   * elements and parent.
   * @param {Utils.WorkflowVisualiser.Record|null} elementBefore
   * @param {Utils.WorkflowVisualiser.Record|null} elementAfter
   * @param {Utils.WorkflowVisualiser.Record|null} parent
   * @returns {Utils.WorkflowVisualiser.VisualiserSpace}
   */
  getInterelementSpaceFor(elementBefore, elementAfter, parent) {
    const type = parent ? 'interblockSpace' : 'interlaneSpace';
    const existingSpace = this.getCachedElement(type, {
      elementBefore,
      elementAfter,
      parent,
    });

    if (existingSpace) {
      return existingSpace;
    } else {
      const {
        mode,
        actionsFactory,
      } = this.getProperties('mode', 'actionsFactory');

      const SpaceClass = type === 'interblockSpace' ? InterblockSpace : InterlaneSpace;
      const newSpace = SpaceClass.create({
        mode,
        actionsFactory,
        elementBefore,
        elementAfter,
        parent,
        onAddElement: (parent, afterElement, newElementProps) =>
          this.addElement(parent, afterElement, newElementProps),
        onDragDropElement: (parent, afterElement, droppedElement) =>
          this.dragDropElement(parent, afterElement, droppedElement),
      });
      this.addElementToCache(type, newSpace);
      return newSpace;
    }
  },

  /**
   * Returns store for given raw data. If it is available in cache, then it
   * is updated. Otherwise it is created from scratch and saved in cache for future updates.
   * @param {Object} storeRawData store representation from backend
   * @returns {Utils.WorkflowVisualiser.Store}
   */
  getStoreForRawData(storeRawData) {
    const {
      id: schemaId,
      instanceId: rawInstanceId,
      name,
      description,
      type,
      config,
      defaultInitialContent,
      requiresInitialContent,
    } = getProperties(
      storeRawData,
      'id',
      'instanceId',
      'name',
      'description',
      'type',
      'config',
      'defaultInitialContent',
      'requiresInitialContent'
    );
    const instanceId = rawInstanceId || (schemaId &&
      this.get(`executionState.store.defined.${schemaId}.instanceId`)
    );
    const contentMayChange = instanceId && !this.isExecutionEnded &&
      !this.isExecutionSuspended;
    const isStoreGenerated = !schemaId;

    const existingStore =
      (instanceId && this.getCachedElement('store', { instanceId })) ||
      (schemaId && this.getCachedElement('store', { schemaId }));

    if (existingStore) {
      const prevInstanceId = get(existingStore, 'instanceId');
      if (prevInstanceId && prevInstanceId !== instanceId) {
        console.error(
          `component:workflow-visualiser#getStoreForRawData: instanceId of a store changed during runtime. schemaId: ${schemaId}, previous instanceId: ${prevInstanceId}, new instanceId: ${instanceId}`
        );
      }

      this.updateElement(existingStore, {
        instanceId,
        name,
        description,
        type,
        config,
        defaultInitialContent,
        requiresInitialContent,
        // `contentMayChange` of generated stores can be changed to `true` only by
        // its container (e.g. task or workflow).
        contentMayChange: (isStoreGenerated && contentMayChange) ?
          existingStore.contentMayChange : contentMayChange,
      });
      return existingStore;
    } else {
      const newStore = Store.create({
        id: schemaId || generateId(),
        schemaId,
        instanceId,
        name,
        description,
        type,
        config,
        defaultInitialContent,
        requiresInitialContent,
        contentMayChange,
        onModify: (store, modifiedProps) => this.modifyElement(store, modifiedProps),
        onRemove: store => this.removeElement(store),
      });
      this.addElementToCache('store', newStore);

      return newStore;
    }
  },

  /**
   * Gets an already generated element from cache. It has to match properties passed
   * via `filterProps`.
   * @param {String} type one of: 'lane', 'interlaneSpace', 'parallelBox', 'task',
   *   'interblockSpace', 'store', 'workflow'
   * @param {Object} filterProps an object which properties should be the same in the
   *   searched element (e.g `{ id: '123' }`)
   * @returns {Utils.WorkflowVisualiser.VisualiserElement|undefined}
   */
  getCachedElement(type, filterProps = {}) {
    const elementsOfType = this.get('elementsCache')[type] || [];
    return elementsOfType.find(element =>
      Object.keys(filterProps).every(filterKey =>
        get(element, filterKey) === filterProps[filterKey]
      )
    );
  },

  /**
   * Stores visualiser element in cache for future usage.
   * @param {String} type  one of: 'lane', 'interlaneSpace', 'parallelBox', 'task',
   *   'interblockSpace'
   * @param {Utils.WorkflowVisualiser.VisualiserElement} element
   * @returns {undefined}
   */
  addElementToCache(type, element) {
    this.get('elementsCache')[type].push(element);
  },

  /**
   * Updates passed visualiser element with updated properties. If some property in update
   * has the same value in the element, then it will not be set.
   * @param {Utils.WorkflowVisualiser.VisualiserElement} element
   * @param {Object} update an object with changed properties
   * @returns {undefined}
   */
  updateElement(element, update) {
    const changedFieldsOnlyUpdate = {};
    for (const key in update) {
      const prevVal = get(element, key);
      const newVal = update[key];
      const isEmberObj = typeOf(newVal) === 'instance';
      if (isEmberObj ? prevVal !== newVal : !_.isEqual(prevVal, newVal)) {
        changedFieldsOnlyUpdate[key] = newVal;
      }
    }

    if (Object.keys(changedFieldsOnlyUpdate).length > 0) {
      setProperties(element, changedFieldsOnlyUpdate);
    }
  },

  /**
   * @param {Utils.WorkflowVisualiser.VisualiserRecord} parent
   * @param {Utils.WorkflowVisualiser.VisualiserRecord|null} afterElement the new element
   *   will be placed after that element. If is `null`, then the new element should be at
   *   the beginning.
   * @param {Object} newElementProps
   * @returns {Promise}
   */
  addElement(parent, afterElement, newElementProps) {
    const rawDump = this.dumpRawData();
    const rawAfterElement = this.getRawElement(rawDump, afterElement);

    const targetElementsArray = this.getRawCollectionForParent(rawDump, parent);
    if (!targetElementsArray || !newElementProps) {
      return resolve();
    }

    if (!newElementProps.id) {
      newElementProps.id = generateId();
    }

    targetElementsArray.splice(
      targetElementsArray.indexOf(rawAfterElement) + 1,
      0,
      newElementProps
    );

    return this.applyChange(rawDump);
  },

  /**
   * @param {Utils.WorkflowVisualiser.Record|null} parent element which should accept
   *   incoming dropped element. Is `null` when dropping lanes.
   * @param {Utils.WorkflowVisualiser.Record|null} afterElement the dropped element will
   *  be placed after that element. If is `null`, then the dropped element should be at
   *  the beginning.
   * @param {Utils.WorkflowVisualiser.Record} droppedElement
   * @returns {Promise}
   */
  dragDropElement(parent, afterElement, droppedElement) {
    if (!droppedElement || afterElement === droppedElement) {
      return resolve();
    }

    const rawDump = this.dumpRawData();
    const rawAfterElement = this.getRawElement(rawDump, afterElement);
    const rawDroppedElement = this.getRawElement(rawDump, droppedElement);

    const sourceElementsArray = this.getRawContainingCollection(rawDump, droppedElement);
    const targetElementsArray = this.getRawCollectionForParent(rawDump, parent);
    if (!sourceElementsArray || !targetElementsArray) {
      return resolve();
    }

    sourceElementsArray.splice(sourceElementsArray.indexOf(rawDroppedElement), 1);
    targetElementsArray.splice(
      targetElementsArray.indexOf(rawAfterElement) + 1,
      0,
      rawDroppedElement
    );

    return this.applyChange(rawDump);
  },

  /**
   * @param {Utils.WorkflowVisualiser.VisualiserElement} element
   * @param {Object} modifiedProps
   * @returns {Promise}
   */
  modifyElement(element, modifiedProps) {
    const rawDump = this.dumpRawData();
    const rawElement = this.getRawElement(rawDump, element);
    if (rawElement && modifiedProps) {
      Object.assign(rawElement, modifiedProps);
    } else {
      return resolve();
    }

    return this.applyChange(rawDump);
  },

  /**
   * @param {Utils.WorkflowVisualiser.VisualiserRecord} element
   * @param {Number} moveStep `-1` to move by one slot left/up, `2` to move by two slots
   *   right/down etc.
   * @returns {Promise}
   */
  moveElement(element, moveStep) {
    const rawDump = this.dumpRawData();
    const rawElement = this.getRawElement(rawDump, element);

    const containingCollection = this.getRawContainingCollection(rawDump, element);
    if (!containingCollection) {
      return resolve();
    }

    const rawElementIdx = containingCollection.indexOf(rawElement);
    containingCollection.splice(rawElementIdx, 1);
    containingCollection.splice(rawElementIdx + moveStep, 0, rawElement);

    return this.applyChange(rawDump);
  },

  /**
   * @param {Utils.WorkflowVisualiser.VisualiserRecord} element
   * @returns {Promise}
   */
  removeElement(element) {
    if (!element) {
      return resolve();
    }

    const rawDump = this.dumpRawData();
    const rawElement = this.getRawElement(rawDump, element);

    const containingCollection = this.getRawContainingCollection(rawDump, element);
    if (!containingCollection) {
      return resolve();
    }

    containingCollection.splice(containingCollection.indexOf(rawElement), 1);

    return this.applyChange(rawDump);
  },

  /**
   * @param {Utils.WorkflowVisualiser.Lane} lane
   * @returns {Promise}
   */
  clearLane(lane) {
    const rawDump = this.dumpRawData();

    const rawLane = this.getRawElement(rawDump, lane);
    if (!rawLane) {
      return resolve();
    }

    rawLane.parallelBoxes = [];

    return this.applyChange(rawDump);
  },

  addStore(newStoreProps) {
    if (!newStoreProps.id) {
      newStoreProps.id = generateId();
    }

    const rawDump = this.dumpRawData();
    if (!rawDump.stores) {
      rawDump.stores = [];
    }

    rawDump.stores.push(newStoreProps);

    return this.applyChange(rawDump).then(() => new Promise(resolve => {
      // getting store instance in scheduleOnce to allow rawData refresh after change
      scheduleOnce('afterRender', this, () =>
        resolve(this.getCachedElement('store', { id: newStoreProps.id }))
      );
    }));
  },

  /**
   * @param {Array<Object>} changedRawDump
   * @returns {Promise}
   */
  applyChange(changedRawDump) {
    const onChange = this.get('onChange');
    if (onChange) {
      return resolve(onChange(
        changedRawDump,
        validateAtmWorkflowSchemaRevision(this.i18n, changedRawDump)
      ));
    } else {
      return resolve();
    }
  },

  /**
   * @returns {Array<Object>} deep copy of `rawData`
   */
  dumpRawData() {
    return _.cloneDeep(this.get('rawData'));
  },

  /**
   * @param {Array<Object>} rawDump
   * @param {Utils.WorkflowVisualiser.VisualiserRecord} element
   * @returns {Object|undefined} raw representation of given `element` in passed `rawDump`
   */
  getRawElement(rawDump, element) {
    if (!rawDump || !element) {
      return undefined;
    }

    const elementType = get(element, '__modelType');
    if (elementType === 'workflow') {
      return rawDump;
    } else if (elementType === 'store') {
      return (rawDump.stores || []).findBy('id', get(element, 'id'));
    } else {
      const elementPath = [];
      let elementPathItem = element;
      while (elementPathItem) {
        if (elementPathItem !== element) {
          elementPath.unshift(elementPathItem);
        }
        elementPathItem = get(elementPathItem, 'parent');
      }

      const rawElementContainingCollection = elementPath.reduce(
        (containingCollection, pathElement) => {
          const rawPathElement = containingCollection &&
            containingCollection.findBy('id', get(pathElement, 'id'));
          return this.getRawCollectionForRawParent(
            get(pathElement, '__modelType'),
            rawPathElement
          );
        },
        rawDump.lanes || []
      );
      return rawElementContainingCollection &&
        rawElementContainingCollection.findBy('id', get(element, 'id')) ||
        undefined;
    }
  },

  /**
   * @param {Array<Object>} rawDump
   * @param {Utils.WorkflowVisualiser.VisualiserRecord} element
   * @returns {Array<Object>|undefined} raw representation of a collection, which
   * contains passed element
   */
  getRawContainingCollection(rawDump, element) {
    const rawElement = this.getRawElement(rawDump, element);

    if (!rawElement) {
      return;
    }

    const elementType = get(element, '__modelType');
    if (elementType === 'store') {
      return rawDump.stores;
    }

    const parent = get(element, 'parent');
    let containingCollection = rawDump && rawDump.lanes || [];
    if (parent) {
      const rawParent = this.getRawElement(rawDump, parent);
      const parentType = get(parent, '__modelType');
      containingCollection = this.getRawCollectionForRawParent(parentType, rawParent);
    }

    return containingCollection && containingCollection.includes(rawElement) ?
      containingCollection : undefined;
  },

  /**
   * @param {Array<Object>} rawDump
   * @param {Utils.WorkflowVisualiser.VisualiserRecord|null} parentElement `null` is when
   *   we consider parents of lanes.
   * @returns {Array<Object>|undefined} raw representation of a collection that is inside
   *   passed parent.
   */
  getRawCollectionForParent(rawDump, parentElement) {
    if (!parentElement) {
      return rawDump && rawDump.lanes || [];
    }

    const rawParent = this.getRawElement(rawDump, parentElement);
    const parentType = parentElement && get(parentElement, '__modelType');
    return this.getRawCollectionForRawParent(parentType, rawParent);
  },

  /**
   * @param {String} parentType
   * @param {Object} rawParent
   * @returns {Array<Object>|undefined}
   */
  getRawCollectionForRawParent(parentType, rawParent) {
    if (!rawParent) {
      return undefined;
    }

    switch (parentType) {
      case 'lane':
        return rawParent.parallelBoxes;
      case 'parallelBox':
        return rawParent.tasks;
      default:
        return undefined;
    }
  },

  /**
   * @param {Utils.WorkflowVisualiser.Lane} lane
   * @param {AtmLaneRunNumber} runNumber
   */
  changeLaneRun(lane, runNumber) {
    set(lane, 'visibleRunNumber', runNumber);
  },

  /**
   * @param {Utils.WorkflowVisualiser.Lane} lane
   */
  async showLatestLaneRun(lane) {
    await this.updateExecutionState();
    const sortedRuns = runsRegistryToSortedArray(get(lane, 'runsRegistry'));
    const newestRun = sortedRuns[sortedRuns.length - 1];
    set(lane, 'visibleRunsPosition', {
      runNumber: newestRun.runNumber,
      placement: 'end',
    });
    this.changeLaneRun(lane, newestRun.runNumber);
  },

  async updateExecutionState() {
    const executionDataFetcher = this.get('executionDataFetcher');
    if (!executionDataFetcher) {
      return;
    }

    const newExecutionState = await executionDataFetcher.fetchExecutionState();
    safeExec(this, () => this.set('executionState', newExecutionState));
  },

  getStoreBySchemaId(schemaId) {
    if (!schemaId) {
      return null;
    }

    return this.get('stores').findBy('schemaId', schemaId) || null;
  },

  getStoreByInstanceId(instanceId) {
    if (!instanceId) {
      return null;
    }

    return this.get('stores').findBy('instanceId', instanceId) || null;
  },

  /**
   * @param {Utils.Action|undefined} action
   * @returns {Utils.Action|undefined}
   */
  normalizeLifecycleChangingAction(action) {
    if (!action) {
      return;
    }
    // Remove hook to be sure, that it won't be duplicated.
    action.removeExecuteHook(this.lifecycleChangingActionHook);
    action.addExecuteHook(this.lifecycleChangingActionHook);
    return action;
  },

  actions: {
    horizonalScroll() {
      this.scheduleHorizontalOverflowDetection();
    },
    scrollLeft() {
      this.scrollToLane(this.get('laneIdxForNextLeftScroll'), 'left');
    },
    scrollRight() {
      this.scrollToLane(this.get('laneIdxForNextRightScroll'), 'right');
    },
  },
});
