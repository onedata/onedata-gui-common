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
 * @module components/workflow-visualiser
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from 'onedata-gui-common/templates/components/workflow-visualiser';
import { computed, observer, get, getProperties, set, setProperties } from '@ember/object';
import ActionsFactory from 'onedata-gui-common/utils/workflow-visualiser/actions-factory';
import WorkflowDataProvider from 'onedata-gui-common/utils/workflow-visualiser/workflow-data-provider';
import Lane from 'onedata-gui-common/utils/workflow-visualiser/lane';
import InterlaneSpace from 'onedata-gui-common/utils/workflow-visualiser/interlane-space';
import ParallelBox from 'onedata-gui-common/utils/workflow-visualiser/lane/parallel-box';
import Task from 'onedata-gui-common/utils/workflow-visualiser/lane/task';
import InterblockSpace from 'onedata-gui-common/utils/workflow-visualiser/lane/interblock-space';
import Store from 'onedata-gui-common/utils/workflow-visualiser/store';
import generateId from 'onedata-gui-common/utils/workflow-visualiser/generate-id';
import { resolve, Promise } from 'rsvp';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import _ from 'lodash';
import { inject as service } from '@ember/service';
import { conditional, raw, tag, string, promise } from 'ember-awesome-macros';
import config from 'ember-get-config';
import WindowResizeHandler from 'onedata-gui-common/mixins/components/window-resize-handler';
import { scheduleOnce, run } from '@ember/runloop';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import Looper from 'onedata-gui-common/utils/looper';
import ArrayProxy from '@ember/array/proxy';
import { reads } from '@ember/object/computed';
import { translateWorkflowStatus, workflowEndedStatuses } from 'onedata-gui-common/utils/workflow-visualiser/statuses';

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
   * @type {Function}
   * @param {Array<any>} rawDataDump deep copy of rawData with modifications applied
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
   * @type {Utils.Looper}
   */
  statsUpdater: undefined,

  /**
   * @type {String}
   */
  executionStatus: undefined,

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
   *   store: Array<Utils.WorkflowVisualiser.Store>
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
   * @type {ComputedProperty<Array<Utils.WorkflowVisualiser.VisualiserElement>>}
   */
  visualiserElements: computed('rawData', function visualiserElements() {
    return this.getVisualiserElements();
  }),

  /**
   * @type {ComputedProperty<Array<Utils.WorkflowVisualiser.Store>>}
   */
  stores: computed('rawData', function stores() {
    return this.getStores();
  }),

  /**
   * @type {ComputedProperty<Array<Utils.WorkflowVisualiser.Store>>}
   */
  storesArrayProxy: computed(function storesArrayProxy() {
    return ArrayProxy
      .extend({ content: reads('component.stores') })
      .create({ component: this });
  }),

  /**
   * @type {ComputedProperty<String>}
   */
  modeClass: tag `mode-${'mode'}`,

  /**
   * @type {ComputedProperty<String>}
   */
  statusClass: tag `status-${'executionStatus'}`,

  /**
   * @type {ComputedProperty<String>}
   */
  statusTranslation: computed('executionStatus', function statusTranslation() {
    const {
      i18n,
      executionStatus,
    } = this.getProperties('i18n', 'executionStatus');
    return translateWorkflowStatus(i18n, executionStatus);
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
    tag `during-${string.dasherize('typeOfDraggedElementModel')}-dragdrop`,
    raw('')
  ),

  /**
   * @type {ComputedProperty<PromiseObject>}
   */
  initialLoadingProxy: promise.object(computed(async function initialLoading() {
    if (this.get('mode') === 'view') {
      return this.updateStatuses();
    }
  })),

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
    });

    if (!this.get('actionsFactory')) {
      this.set('actionsFactory', ActionsFactory.create({ ownerSource: this }));
    }
    this.actionsFactoryObserver();
    this.get('visualiserElements');
    if (this.get('mode') === 'view') {
      this.get('initialLoadingProxy')
        .then(() => safeExec(this, 'setupStatsUpdater'));
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
      this.stopStatsUpdater();
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

  setupStatsUpdater() {
    if (this.executionHasEnded()) {
      return;
    }

    const statsUpdater = Looper.create({
      immediate: false,
      interval: statsUpdateInterval,
    });
    statsUpdater.on('tick', () => this.updateStatuses());
    this.set('statsUpdater', statsUpdater);
  },

  stopStatsUpdater() {
    const statsUpdater = this.get('statsUpdater');
    if (statsUpdater) {
      safeExec(statsUpdater, () => statsUpdater.destroy());
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
    if (!this.$()) {
      return;
    }

    // Scrolling is not pixel-perfect. Without that epsilon test cases break down.
    const checksPxEpsilon = 1;

    const $lanesContainer = this.$('.visualiser-elements');
    if (!$lanesContainer.length) {
      return;
    }
    const viewOffset = $lanesContainer.offset().left;
    const viewWidth = $lanesContainer.width();

    const $lanes = this.$('.workflow-visualiser-lane');
    const lanesOffset = $lanes.map(idx => $lanes.eq(idx).offset().left);
    const lanesWidth = $lanes.map(idx => $lanes.eq(idx).width());

    let laneIdxForNextLeftScroll = null;
    for (let i = 0; i < $lanes.length; i++) {
      if (viewOffset - lanesOffset[i] <= checksPxEpsilon) {
        break;
      }
      laneIdxForNextLeftScroll = i;
    }

    let laneIdxForNextRightScroll = null;
    for (let i = $lanes.length - 1; i >= 0; i--) {
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

    const $lanesContainer = this.$('.visualiser-elements');
    const viewOffset = $lanesContainer.offset().left;
    const viewWidth = $lanesContainer.width();
    const viewScroll = $lanesContainer.scrollLeft();

    const $lanes = this.$('.workflow-visualiser-lane');

    let scrollPosition;
    if (laneIdx <= 0) {
      scrollPosition = 0;
    } else if (laneIdx >= $lanes.length - 1) {
      scrollPosition = $lanesContainer.prop('scrollWidth');
    } else {
      const $targetLane = $lanes.eq(laneIdx);
      const targetLaneOffset = $targetLane.offset().left;
      const targetLaneWidth = $targetLane.width();
      let pxToScroll;
      if (edge === 'left') {
        pxToScroll = targetLaneOffset - viewOffset;
      } else {
        pxToScroll = targetLaneOffset + targetLaneWidth - (viewOffset + viewWidth);
      }
      scrollPosition = viewScroll + pxToScroll;
    }

    $lanesContainer[0].scroll({
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
   * Generates an array of stores from `rawData`
   * @returns {Array<Utils.WorkflowVisualiser.Store>}
   */
  getStores() {
    const rawStores = this.get('rawData.stores') || [];
    return rawStores.map(rawStore => this.getElementForRawData('store', rawStore));
  },

  /**
   * Generates an array of lanes and interlane spaces from `rawData`
   * @returns {Array<Utils.WorkflowVisualiser.Lane|Utils.WorkflowVisualiser.InterlaneSpace>}
   */
  getVisualiserElements() {
    const rawLanes = this.get('rawData.lanes') || [];
    const lanes = rawLanes.map(rawLane => this.getElementForRawData('lane', rawLane));
    this.updateFirstLastFlagsInCollection(lanes);

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
   * Sets correct values of `isFirst` and `isLast` flags in elements of passed collection.
   * @param {Array<Utils.WorkflowVisualiser.VisualiserElement>} collection
   */
  updateFirstLastFlagsInCollection(collection) {
    for (let i = 0; i < collection.length; i++) {
      const item = collection[i];
      const {
        isFirst,
        isLast,
      } = getProperties(item, 'isFirst', 'isLast');

      if (i === 0 && !isFirst) {
        set(item, 'isFirst', true);
      } else if (i !== 0 && isFirst) {
        set(item, 'isFirst', false);
      }
      if (i === collection.length - 1 && !isLast) {
        set(item, 'isLast', true);
      } else if (i !== collection.length - 1 && isLast) {
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
      storeIteratorSpec,
      parallelBoxes: rawParallelBoxes,
    } = getProperties(laneRawData, 'id', 'name', 'storeIteratorSpec', 'parallelBoxes');

    const existingLane = this.getCachedElement('lane', { id });

    if (existingLane) {
      const elements = this.getLaneElementsForRawData(
        'parallelBox',
        rawParallelBoxes,
        existingLane
      );
      this.updateElement(existingLane, { name, storeIteratorSpec, elements });
      return existingLane;
    } else {
      const {
        mode,
        storesArrayProxy,
        actionsFactory,
      } = this.getProperties('mode', 'storesArrayProxy', 'actionsFactory');

      const newLane = Lane.create({
        id,
        name,
        storeIteratorSpec,
        stores: storesArrayProxy,
        mode,
        actionsFactory,
        onModify: (lane, modifiedProps) => this.modifyElement(lane, modifiedProps),
        onMove: (lane, moveStep) => this.moveElement(lane, moveStep),
        onClear: lane => this.clearLane(lane),
        onRemove: lane => this.removeElement(lane),
      });
      set(
        newLane,
        'elements',
        this.getLaneElementsForRawData('parallelBox', rawParallelBoxes, newLane)
      );
      this.addElementToCache('lane', newLane);

      return newLane;
    }
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
    this.updateFirstLastFlagsInCollection(elementsForRawData);

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

    const existingParallelBox = this.getCachedElement('parallelBox', { id });

    if (existingParallelBox) {
      const elements = this.getLaneElementsForRawData(
        'task',
        rawTasks,
        existingParallelBox
      );
      this.updateElement(existingParallelBox, { name, parent, elements });
      return existingParallelBox;
    } else {
      const {
        mode,
        actionsFactory,
      } = this.getProperties('mode', 'actionsFactory');

      const newParallelBox = ParallelBox.create({
        id,
        name,
        parent,
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
      argumentMappings,
      resultMappings,
      status,
      progressPercent,
    } = getProperties(
      taskRawData,
      'id',
      'name',
      'lambdaId',
      'argumentMappings',
      'resultMappings',
      'status',
      'progressPercent'
    );

    const existingTask = this.getCachedElement('task', { id });

    if (existingTask) {
      this.updateElement(existingTask, {
        name,
        parent,
        lambdaId,
        argumentMappings,
        resultMappings,
        status,
        progressPercent,
      });
      return existingTask;
    } else {
      const {
        mode,
        actionsFactory,
      } = this.getProperties('mode', 'actionsFactory');

      const newTask = Task.create({
        id,
        name,
        parent,
        lambdaId,
        mode,
        actionsFactory,
        argumentMappings,
        resultMappings,
        status,
        progressPercent,
        onModify: (task, modifiedProps) => this.modifyElement(task, modifiedProps),
        onRemove: task => this.removeElement(task),
      });
      this.addElementToCache('task', newTask);

      return newTask;
    }
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
      id,
      name,
      description,
      type,
      dataSpec,
      defaultInitialValue,
      requiresInitialValue,
    } = getProperties(
      storeRawData,
      'id',
      'name',
      'description',
      'type',
      'dataSpec',
      'defaultInitialValue',
      'requiresInitialValue'
    );

    const existingStore = this.getCachedElement('store', { id });

    if (existingStore) {
      this.updateElement(existingStore, {
        name,
        description,
        type,
        dataSpec,
        defaultInitialValue,
        requiresInitialValue,
      });
      return existingStore;
    } else {
      const newStore = Store.create({
        id,
        name,
        description,
        type,
        dataSpec,
        defaultInitialValue,
        requiresInitialValue,
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
   *   'interblockSpace'
   * @param {Object} filterProps an object which properties should be the same in the
   *   searched element (e.g `{ id: '123' }`)
   * @returns {Utils.WorkflowVisualiser.VisualiserElement|undefined}
   */
  getCachedElement(type, filterProps) {
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
      if (!_.isEqual(get(element, key), update[key])) {
        changedFieldsOnlyUpdate[key] = update[key];
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
      return resolve(onChange(changedRawDump));
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
    if (elementType === 'store') {
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

  async updateStatuses() {
    const executionDataFetcher = this.get('executionDataFetcher');
    if (!executionDataFetcher) {
      return;
    }

    const statuses = await executionDataFetcher.fetchStatuses();
    safeExec(this, () => {
      ['lane', 'parallelBox', 'task'].forEach(elementType => {
        Object.keys(statuses[elementType] || {}).forEach(id => {
          const element = this.getCachedElement(elementType, { id });
          if (!element) {
            return;
          }

          set(element, 'status', statuses[elementType][id].status);
          if (elementType === 'task') {
            setProperties(element, getProperties(
              statuses[elementType][id],
              'itemsFailed',
              'itemsInProcessing',
              'itemsProcessed'
            ));
          }
        });
      });
      this.set('executionStatus', get(statuses, 'global.status'));
      if (this.executionHasEnded()) {
        this.stopStatsUpdater();
        this.get('stores').setEach('contentMayChange', false);
      }
    });
  },

  executionHasEnded() {
    return workflowEndedStatuses.includes(this.get('executionStatus'));
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
