/**
 * Is responsible for showing and editing workflows.
 *
 * Workflow is a description of some ordered collection of files tasks. Order of the
 * execution is described by lanes and parallel blocks - both of them are responsible for
 * grouping tasks. Execution goes as follows:
 * 1. Tasks are being executed lane-by-lane. Next lane is started only when the previous
 * lane was completely done for all files.
 * 2. Tasks inside each lane are grouped by parallel blocks. All tasks inside the same
 * parallel block can be executed in the same time and file.
 * 3. Each file can be processed only in one parallel block at a time. When some file was
 * processed by all tasks in some parallel block, then it can be processed by the tasks
 * inside the next parallel block. Files do not wait for each other during the parallel
 * blocks execution - files have separated block-by-block execution.
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
 *  +--+---+   +--------+-------+   +--+---+   +--------+--------+   +---------+--------+
 *  | Lane |   | Parallel block |   | Task |   | Interlane space |   | Interblock space |
 *  +------+   +----------------+   +------+   +-----------------+   +------------------+
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
 *              +--------v-------+     +---------v--------+
 *              | Parallel block |     | Interblock space |
 *              +--------+-------+     +------------------+
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
import { computed, get, getProperties, set, setProperties } from '@ember/object';
import Lane from 'onedata-gui-common/utils/workflow-visualiser/lane';
import InterlaneSpace from 'onedata-gui-common/utils/workflow-visualiser/interlane-space';
import ParallelBlock from 'onedata-gui-common/utils/workflow-visualiser/lane/parallel-block';
import Task from 'onedata-gui-common/utils/workflow-visualiser/lane/task';
import InterblockSpace from 'onedata-gui-common/utils/workflow-visualiser/lane/interblock-space';
import { resolve } from 'rsvp';
import { guidFor } from '@ember/object/internals';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import _ from 'lodash';
import { inject as service } from '@ember/service';
import { conditional, raw, tag, string } from 'ember-awesome-macros';
import config from 'ember-get-config';
import WindowResizeHandler from 'onedata-gui-common/mixins/components/window-resize-handler';
import { scheduleOnce, run } from '@ember/runloop';

const isInTestingEnv = config.environment === 'test';
const windowResizeDebounceTime = isInTestingEnv ? 0 : 30;

export default Component.extend(I18n, WindowResizeHandler, {
  layout,
  classNames: ['workflow-visualiser'],
  classNameBindings: [
    'modeClass',
    'duringDragDropClass',
  ],

  i18n: service(),
  dragCoordinator: service(),

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
   * @virtual
   * @type {Array<any>}
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
   * @type {Object}
   * ```
   * {
   *   lane: Array<Utils.WorkflowVisualiser.VisualiserElement>,
   *   interlaneSpace: Array<Utils.WorkflowVisualiser.InterlaneSpace>,
   *   parallelBlock: Array<Utils.WorkflowVisualiser.Lane.ParallelBlock>,
   *   task: Array<Utils.WorkflowVisualiser.Lane.Task>,
   *   interblockSpace: Array<Utils.WorkflowVisualiser.Lane.InterblockSpace>,
   * }
   * ```
   */
  elementsCache: undefined,

  /**
   * Null when left scroll should be blocked
   * @type {Number|null}
   */
  laneIdxForNextLeftScroll: null,

  /**
   * Null when right scroll should be blocked
   * @type {Number|null}
   */
  laneIdxForNextRightScroll: null,

  /**
   * @type {ComputedProperty<Array<Utils.WorkflowVisualiser.VisualiserElement>>}
   */
  visualiserElements: computed('rawData.[]', function visualiserElements() {
    return this.getVisualiserElements();
  }),

  /**
   * @type {ComputedProperty<String>}
   */
  modeClass: tag `mode-${'mode'}`,

  /**
   * @type {ComputedProperty<String|undefined>}
   */
  typeOfDraggedElement: computed(
    'dragCoordinator.currentDragObject',
    function typeOfDraggedElement() {
      const currentDragObject = this.get('dragCoordinator.currentDragObject');
      const draggedElement = currentDragObject &&
        get(currentDragObject, get(currentDragObject, 'unwrappingKey'));

      if (draggedElement) {
        const {
          objectOrigin,
          type,
        } = getProperties(draggedElement, 'objectOrigin', 'type');
        return objectOrigin === 'workflowVisualiser' ? type : undefined;
      }

      return undefined;
    }
  ),

  /**
   * @type {ComputedProperty<String>}
   */
  duringDragDropClass: conditional(
    'typeOfDraggedElement',
    tag `during-${string.dasherize('typeOfDraggedElement')}-dragdrop`,
    raw('')
  ),

  /**
   * @override
   */
  init() {
    this._super(...arguments);

    this.set('elementsCache', {
      lane: [],
      interlaneSpace: [],
      parallelBlock: [],
      task: [],
      interblockSpace: [],
    });
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
  onWindowResize() {
    run(() => this.scheduleHorizontalOverflowDetection());
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
   * Generates an array of lanes and interlane spaces from `rawData`
   * @returns {Array<Utils.WorkflowVisualiser.Lane|Utils.WorkflowVisualiser.InterlaneSpace>}
   */
  getVisualiserElements() {
    const rawData = this.get('rawData') || [];
    const lanes = rawData.map(rawLane => this.getElementForUpdate(rawLane));
    this.updateFirstLastFlagsInCollection(lanes);

    const visualiserElements = [
      this.getSpaceFor(null, lanes[0] || null, null),
    ];
    for (let i = 0; i < lanes.length; i++) {
      const lane = lanes[i];
      const nextLane = lanes[i + 1] || null;
      visualiserElements.push(
        lane,
        this.getSpaceFor(lane, nextLane, null)
      );
    }

    return visualiserElements;
  },

  /**
   * Returns visualiser element for given backend update.
   * @param {Object} update element representation from backend
   * @param {Utils.WorkflowVisualiser.Lane|Utils.WorkflowVisualiser.Lane.ParallelBlock} [parent=null]
   */
  getElementForUpdate(update, parent = null) {
    switch (update.type) {
      case 'lane':
        // Lane does not have any parent
        return this.getLaneForUpdate(update);
      case 'parallelBlock':
        return this.getParallelBlockForUpdate(update, parent);
      case 'task':
        return this.getTaskForUpdate(update, parent);
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
   * Returns lane element for given backend update. If it is available in cache,
   * then it is updated. Otherwise it is created from scratch and saved in cache for
   * future updates.
   * @param {Object} update lane representation from backend
   * @returns {Utils.WorkflowVisualiser.Lane}
   */
  getLaneForUpdate(laneUpdate) {
    const {
      id,
      name,
      tasks: rawElements,
    } = getProperties(laneUpdate, 'id', 'name', 'tasks');

    const existingLane = this.getCachedElement('lane', { id });

    if (existingLane) {
      const elements = this.getLaneElementsForUpdate(rawElements, existingLane);
      this.updateElement(existingLane, { name, elements });

      return existingLane;
    } else {
      const newLane = Lane.create({
        id,
        name,
        mode: this.get('mode'),
        onModify: (lane, modifiedProps) => this.modifyElement(lane, modifiedProps),
        onMove: (lane, moveStep) => this.moveElement(lane, moveStep),
        onClear: lane => this.clearLane(lane),
        onRemove: lane => this.removeElement(lane),
      });
      set(
        newLane,
        'elements',
        this.getLaneElementsForUpdate(rawElements, newLane)
      );
      this.addElementToCache('lane', newLane);

      return newLane;
    }
  },

  /**
   * Returns array of lane elements for given backend update. Handles two types of
   * collections:
   * - list of parallel blocks in a lane,
   * - list of tasks in a parralel block.
   * If the result array has the same elements as were in the existing array in `parent`,
   * then the existing array is returned (the same reference is preserved).
   * @param {Array<Object>} update array of task/parallel block backend representations
   * @param {Utils.WorkflowVisualiser.Lane|Utils.WorkflowVisualiser.Lane.ParallelBlock} parent
   * @returns {Array<Utils.WorkflowVisualiser.VisualiserElement>}
   */
  getLaneElementsForUpdate(update, parent) {
    const existingLaneElements = get(parent || {}, 'elements') || [];
    const elementsForUpdate = (update || []).map(elementUpdate =>
      this.getElementForUpdate(elementUpdate, parent)
    );
    this.updateFirstLastFlagsInCollection(elementsForUpdate);

    const newLaneElements = [
      this.getSpaceFor(null, elementsForUpdate[0] || null, parent),
    ];

    for (let i = 0; i < elementsForUpdate.length; i++) {
      const updatedElement = elementsForUpdate[i];
      const nextUpdatedElement = elementsForUpdate[i + 1] || null;
      newLaneElements.push(
        updatedElement,
        this.getSpaceFor(updatedElement, nextUpdatedElement, parent)
      );
    }

    const elementsArrayHasChanged = !existingLaneElements ||
      newLaneElements.some((element, idx) => existingLaneElements[idx] !== element);

    return elementsArrayHasChanged ? newLaneElements : existingLaneElements;
  },

  /**
   * Returns parallel block element for given backend update. If it is available in cache,
   * then it is updated. Otherwise it is created from scratch and saved in cache for
   * future updates.
   * @param {Object} update parallel block representation from backend
   * @param {Utils.WorkflowVisualiser.Lane} parent
   * @returns {Utils.WorkflowVisualiser.Lane.ParallelBlock}
   */
  getParallelBlockForUpdate(update, parent) {
    const {
      id,
      name,
      tasks: rawElements,
    } = getProperties(update, 'id', 'name', 'tasks');

    const existingParallelBlock = this.getCachedElement('parallelBlock', { id });

    if (existingParallelBlock) {
      const elements = this.getLaneElementsForUpdate(rawElements, existingParallelBlock);
      this.updateElement(existingParallelBlock, { name, parent, elements });

      return existingParallelBlock;
    } else {
      const newParallelBlock = ParallelBlock.create({
        id,
        name,
        parent,
        mode: this.get('mode'),
        onModify: (block, modifiedProps) => this.modifyElement(block, modifiedProps),
        onMove: (block, moveStep) => this.moveElement(block, moveStep),
        onRemove: block => this.removeElement(block),
      });
      set(
        newParallelBlock,
        'elements',
        this.getLaneElementsForUpdate(rawElements, newParallelBlock)
      );
      this.addElementToCache('parallelBlock', newParallelBlock);

      return newParallelBlock;
    }
  },

  /**
   * Returns task element for given backend update. If it is available in cache, then it
   * is updated. Otherwise it is created from scratch and saved in cache for future updates.
   * @param {Object} update task representation from backend
   * @param {Utils.WorkflowVisualiser.Lane.ParallelBlock} parent
   * @returns {Utils.WorkflowVisualiser.Lane.Task}
   */
  getTaskForUpdate(update, parent) {
    const {
      id,
      name,
      status,
      progressPercent,
    } = getProperties(update, 'id', 'name', 'status', 'progressPercent');

    const existingTask = this.getCachedElement('task', { id });

    if (existingTask) {
      this.updateElement(existingTask, { name, parent, status, progressPercent });

      return existingTask;
    } else {
      const newTask = Task.create({
        id,
        name,
        parent,
        mode: this.get('mode'),
        status,
        progressPercent,
        onModify: (block, modifiedProps) => this.modifyElement(block, modifiedProps),
        onRemove: lane => this.removeElement(lane),
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
  getSpaceFor(elementBefore, elementAfter, parent) {
    const type = parent ? 'interblockSpace' : 'interlaneSpace';
    const existingSpace = this.getCachedElement(type, {
      elementBefore,
      elementAfter,
      parent,
    });

    if (existingSpace) {
      return existingSpace;
    } else {
      const SpaceClass = type === 'interblockSpace' ? InterblockSpace : InterlaneSpace;
      const newSpace = SpaceClass.create({
        mode: this.get('mode'),
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
   * Gets an already generated element from cache. It has to match properties passed
   * via `filterProps`.
   * @param {String} type one of: 'lane', 'interlaneSpace', 'parallelBlock', 'task',
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
   * @param {String} type  one of: 'lane', 'interlaneSpace', 'parallelBlock', 'task',
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
      if (get(element, key) !== update[key]) {
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
      newElementProps.id = guidFor(newElementProps);
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

    rawLane.tasks.length = 0;

    return this.applyChange(rawDump);
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
    if (!element) {
      return undefined;
    } else if (get(element, 'type') === 'lane') {
      return rawDump.findBy('id', get(element, 'id'));
    } else {
      const idsPath = [];
      let parentsPathElement = element;
      while (parentsPathElement) {
        idsPath.push(get(parentsPathElement, 'id'));
        parentsPathElement = get(parentsPathElement, 'parent');
      }
      idsPath.reverse();

      const rawBlock = idsPath.slice(1).reduce(
        (prevRawParent, id) =>
        prevRawParent && prevRawParent.tasks && prevRawParent.tasks.findBy('id', id),
        rawDump.findBy('id', idsPath[0])
      );
      return rawBlock;
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

    const parent = get(element, 'parent');
    let containingCollection = rawDump;
    if (parent) {
      const rawParent = this.getRawElement(rawDump, parent);
      containingCollection = rawParent ? rawParent.tasks : undefined;
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
      return rawDump;
    }

    const rawParent = this.getRawElement(rawDump, parentElement);
    return rawParent && rawParent.tasks ? rawParent.tasks : undefined;
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
