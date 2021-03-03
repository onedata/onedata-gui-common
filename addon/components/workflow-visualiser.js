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
import { tag } from 'ember-awesome-macros';
import config from 'ember-get-config';
import WindowResizeHandler from 'onedata-gui-common/mixins/components/window-resize-handler';
import { scheduleOnce, run } from '@ember/runloop';

const isInTestingEnv = config.environment === 'test';
const windowResizeDebounceTime = isInTestingEnv ? 0 : 30;

export default Component.extend(I18n, WindowResizeHandler, {
  layout,
  classNames: ['workflow-visualiser'],
  classNameBindings: ['modeClass'],

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.workflowVisualiser',

  /**
   * @virtual
   * @type {Array<any>}
   */
  rawLanes: undefined,

  /**
   * One of: 'edit', 'view'
   * @virtual
   * @type {String}
   */
  mode: 'edit',

  /**
   * @virtual optional
   * @type {Function}
   * @param {Array<Object>} rawLanesDump
   * @returns {Promise}
   */
  onChange: undefined,

  /**
   * @override
   */
  callWindowResizeHandlerOnInsert: false,

  /**
   * @override
   */
  windowResizeDebounceTime,

  /**
   * @type {Array<Utils.WorkflowVisualiser.VisualiserElement>}
   */
  visualiserElementsCache: undefined,

  /**
   * @type {Object}
   * ```
   * {
   *   lane: Array<Array<Utils.WorkflowVisualiser.VisualiserElement>,
   *   interlaneSpace: Array<Utils.WorkflowVisualiser.InterlaneSpace>,
   *   parallelBlock: Array<Utils.WorkflowVisualiser.Lane.ParallelBlock>,
   *   task: Array<Utils.WorkflowVisualiser.Lane.Task>,
   *   interblockSpace: Array<Utils.WorkflowVisualiser.Lane.InterblockSpace>,
   * }
   * ```
   */
  elementsCache: undefined,

  /**
   * @type {Number|null}
   */
  scrollLeftNextLane: null,

  /**
   * @type {Number|null}
   */
  scrollRightNextLane: null,

  /**
   * @type {ComputedProperty<Array<Utils.WorkflowVisualiser.VisualiserElement>>}
   */
  visualiserElements: computed('rawLanes.[]', function visualiserElements() {
    return this.getVisualiserElements();
  }),

  /**
   * @type {ComputedProperty<String>}
   */
  modeClass: tag `mode-${'mode'}`,

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

    const $lanes = this.$('.workflow-visualiser-lane');
    const $visualiserElements = this.$('.visualiser-elements');
    const viewOffset = $visualiserElements.offset().left;
    const viewWidth = $visualiserElements.width();

    let scrollLeftNextLane = null;
    for (let i = 0; i < $lanes.length; i++) {
      if (viewOffset - $lanes.eq(i).offset().left <= checksPxEpsilon) {
        break;
      }
      scrollLeftNextLane = i;
    }

    let scrollRightNextLane = null;
    for (let i = $lanes.length - 1; i >= 0; i--) {
      if (
        $lanes.eq(i).offset().left + $lanes.eq(i).width() - (viewOffset + viewWidth) <=
        checksPxEpsilon
      ) {
        break;
      }
      scrollRightNextLane = i;
    }

    this.setProperties({
      scrollLeftNextLane,
      scrollRightNextLane,
    });
  },

  scrollToLane(laneIdx, edge) {
    if (laneIdx === null) {
      return;
    }

    const $lanesContainer = this.$('.visualiser-elements');
    const $lanes = this.$('.workflow-visualiser-lane');
    let scrollXPosition;
    if (laneIdx <= 0) {
      scrollXPosition = 0;
    } else if (laneIdx >= $lanes.length - 1) {
      scrollXPosition = $lanesContainer.prop('scrollWidth');
    } else {
      const $targetLane = $lanes.eq(laneIdx);
      let targetLaneOffset;
      if (edge === 'left') {
        targetLaneOffset = $targetLane.offset().left - $lanesContainer.offset().left;
      } else {
        targetLaneOffset = $targetLane.offset().left + $targetLane.width() -
          ($lanesContainer.offset().left + $lanesContainer.width());
      }
      scrollXPosition = $lanesContainer.scrollLeft() + targetLaneOffset;
    }

    $lanesContainer[0].scroll({
      left: scrollXPosition,
      behavior: isInTestingEnv ? 'auto' : 'smooth',
    });

    // `scrollToLane` should trigger scroll event, so
    // `scheduleHorizontalOverflowDetection` would be called without the line below.
    // But sometimes scroll event is not triggered at all (scrollbar bug?) and we need
    // to kick the detection manually.
    this.scheduleHorizontalOverflowDetection();
  },

  getVisualiserElements() {
    const {
      visualiserElementsCache,
      rawLanes,
    } = this.getProperties('visualiserElementsCache', 'rawLanes');

    const lanes = (rawLanes || []).map(rawLane => this.getLaneForUpdate(rawLane));
    this.updateFirstLastFlagsInCollection(lanes);

    const newVisualiserElements = [
      this.getInterlaneSpaceFor(null, lanes[0] || null),
    ];

    for (let i = 0; i < lanes.length; i++) {
      const lane = lanes[i];
      const nextLane = lanes[i + 1] || null;
      newVisualiserElements.push(
        lane,
        this.getInterlaneSpaceFor(lane, nextLane)
      );
    }

    const elementsArrayHasChanged = !visualiserElementsCache || newVisualiserElements
      .some((element, idx) => visualiserElementsCache[idx] !== element);

    if (elementsArrayHasChanged) {
      this.set('visualiserElementsCache', newVisualiserElements);
      return newVisualiserElements;
    } else {
      return visualiserElementsCache;
    }
  },

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
      } else if (isFirst !== collection.length - 1 && isLast) {
        set(item, 'isLast', false);
      }
    }
  },

  getLaneForUpdate(laneUpdate) {
    const {
      id,
      name,
      tasks: rawElements,
    } = getProperties(laneUpdate, 'id', 'name', 'tasks');

    const existingLane = this.getCachedElement('lane', { id });

    if (existingLane) {
      const {
        name: oldName,
        elements: oldElements,
      } = getProperties(existingLane, 'name', 'tasks');
      const elements = this.getLaneElementsForUpdate(existingLane, rawElements);

      this.performModelUpdate(existingLane, [
        ['name', oldName, name],
        ['elements', oldElements, elements],
      ]);

      return existingLane;
    } else {
      const newLane = Lane.create({
        id,
        name,
        mode: this.get('mode'),
        onModify: (lane, modifiedProps) => this.modifyLane(lane, modifiedProps),
        onMove: (lane, moveStep) => this.moveLane(lane, moveStep),
        onClear: lane => this.clearLane(lane),
        onRemove: lane => this.removeLane(lane),
      });
      set(
        newLane,
        'elements',
        this.getLaneElementsForUpdate(newLane, rawElements)
      );
      this.addElementToCache('lane', newLane);

      return newLane;
    }
  },

  getLaneElementsForUpdate(parent, elementsUpdate) {
    const existingLaneElements = get(parent || {}, 'elements') || [];
    const elementsForUpdate = (elementsUpdate || []).map(elementUpdate => {
      switch (elementUpdate.type) {
        case 'parallelBlock':
          return this.getParallelBlockForUpdate(elementUpdate, parent);
        case 'task':
          return this.getTaskForUpdate(elementUpdate, parent);
      }
    });
    this.updateFirstLastFlagsInCollection(elementsForUpdate);

    const newLaneElements = [
      this.getInterblockSpaceFor(null, elementsForUpdate[0] || null, parent),
    ];

    for (let i = 0; i < elementsForUpdate.length; i++) {
      const updatedElement = elementsForUpdate[i];
      const nextUpdatedElement = elementsForUpdate[i + 1] || null;
      newLaneElements.push(
        updatedElement,
        this.getInterblockSpaceFor(updatedElement, nextUpdatedElement, parent)
      );
    }

    const elementsArrayHasChanged = !existingLaneElements ||
      newLaneElements.some((element, idx) => existingLaneElements[idx] !== element);

    return elementsArrayHasChanged ? newLaneElements : existingLaneElements;
  },

  getParallelBlockForUpdate(parallelBlockUpdate, parent) {
    const {
      id,
      name,
      tasks: rawElements,
    } = getProperties(parallelBlockUpdate, 'id', 'name', 'tasks');

    const existingParallelBlock = this.getCachedElement('parallelBlock', { id });

    if (existingParallelBlock) {
      const {
        name: oldName,
        parent: oldParent,
        elements: oldElements,
      } = getProperties(existingParallelBlock, 'name', 'tasks');
      const elements = this.getLaneElementsForUpdate(existingParallelBlock, rawElements);

      this.performModelUpdate(existingParallelBlock, [
        ['name', oldName, name],
        ['parent', oldParent, parent],
        ['elements', oldElements, elements],
      ]);

      return existingParallelBlock;
    } else {
      const newParallelBlock = ParallelBlock.create({
        id,
        name,
        parent,
        mode: this.get('mode'),
        onModify: (block, modifiedProps) => this.modifyBlock(block, modifiedProps),
        onMove: (block, moveStep) => this.moveBlock(block, moveStep),
        onRemove: block => this.removeBlock(block),
      });
      set(
        newParallelBlock,
        'elements',
        this.getLaneElementsForUpdate(newParallelBlock, rawElements)
      );
      this.addElementToCache('parallelBlock', newParallelBlock);

      return newParallelBlock;
    }
  },

  getTaskForUpdate(taskUpdate, parent) {
    const {
      id,
      name,
      progressPercent,
    } = getProperties(taskUpdate, 'id', 'name', 'progressPercent');

    const existingTask = this.getCachedElement('task', { id });

    if (existingTask) {
      const {
        name: oldName,
        parent: oldParent,
        progressPercent: oldProgressPercent,
      } = getProperties(existingTask, 'name', 'tasks', 'parent', 'progressPercent');

      this.performModelUpdate(existingTask, [
        ['name', oldName, name],
        ['parent', oldParent, parent],
        ['progressPercent', oldProgressPercent, progressPercent],
      ]);

      return existingTask;
    } else {
      const newTask = Task.create({
        id,
        name,
        parent,
        mode: this.get('mode'),
        progressPercent,
        onModify: (block, modifiedProps) => this.modifyBlock(block, modifiedProps),
        onRemove: lane => this.removeBlock(lane),
      });
      this.addElementToCache('task', newTask);

      return newTask;
    }
  },

  getInterlaneSpaceFor(firstLane, secondLane) {
    const existingInterlaneSpace = this.getCachedElement('interlaneSpace', {
      firstLane,
      secondLane,
    });

    if (existingInterlaneSpace) {
      return existingInterlaneSpace;
    } else {
      const newSpace = InterlaneSpace.create({
        mode: this.get('mode'),
        firstLane,
        secondLane,
        onAddLane: afterLane => this.addLane(afterLane),
      });
      this.addElementToCache('interlaneSpace', newSpace);
      return newSpace;
    }
  },

  getInterblockSpaceFor(firstBlock, secondBlock, parent) {
    const existingInterblockSpace = this.getCachedElement('interblockSpace', {
      firstBlock,
      secondBlock,
      parent,
    });

    if (existingInterblockSpace) {
      return existingInterblockSpace;
    } else {
      const newSpace = InterblockSpace.create({
        mode: this.get('mode'),
        firstBlock,
        secondBlock,
        parent,
        onAddBlock: (parent, afterBlock) => this.addBlock(parent, afterBlock),
      });
      this.addElementToCache('interblockSpace', newSpace);
      return newSpace;
    }
  },

  getCachedElement(type, filterProps) {
    const elementsOfType = this.get('elementsCache')[type] || [];
    return elementsOfType.find(element =>
      Object.keys(filterProps).every(filterKey =>
        get(element, filterKey) === filterProps[filterKey]
      )
    );
  },

  addElementToCache(type, element) {
    this.get('elementsCache')[type].push(element);
  },

  performModelUpdate(modelRecord, updatesToCheck) {
    const update = {};
    updatesToCheck.forEach(([propName, oldValue, newValue]) => {
      if (oldValue !== newValue) {
        update[propName] = newValue;
      }
    });

    if (Object.keys(update).length > 0) {
      setProperties(modelRecord, update);
      return true;
    }
    return false;
  },

  addLane(afterLane) {
    const newLane = {
      type: 'lane',
      name: String(this.t('nameForNew.lane')),
      tasks: [],
    };
    newLane.id = guidFor(newLane);

    const lanesDump = this.dumpRawLanes();
    const laneInsertIdx = !afterLane ? 0 :
      lanesDump.indexOf(lanesDump.findBy('id', get(afterLane, 'id'))) + 1;
    lanesDump.splice(laneInsertIdx, 0, newLane);

    return this.applyChange(lanesDump);
  },

  addBlock(parent, afterBlock) {
    const type = get(parent, 'type') === 'lane' ? 'parallelBlock' : 'task';
    const newBlock = {
      type,
      name: String(this.t(`nameForNew.${type}`)),
    };
    newBlock.id = guidFor(newBlock);
    if (type === 'parallelBlock') {
      newBlock.tasks = [];
    }

    const lanesDump = this.dumpRawLanes();
    const rawParent = this.getRawElement(lanesDump, parent);
    if (rawParent && rawParent.tasks) {
      const blockInsertIdx = !afterBlock ? 0 :
        rawParent.tasks.indexOf(rawParent.tasks.findBy('id', get(afterBlock, 'id'))) + 1;
      rawParent.tasks.splice(blockInsertIdx, 0, newBlock);
    }

    return this.applyChange(lanesDump);
  },

  modifyLane(lane, modifiedProps) {
    return this.modifyElement(lane, modifiedProps);
  },

  modifyBlock(block, modifiedProps) {
    return this.modifyElement(block, modifiedProps);
  },

  modifyElement(element, modifiedProps) {
    const rawDump = this.dumpRawLanes();
    const rawElement = this.getRawElement(rawDump, element);
    if (rawElement && modifiedProps) {
      Object.assign(rawElement, modifiedProps);
    }

    return this.applyChange(rawDump);
  },

  moveLane(lane, moveStep) {
    const rawDump = this.dumpRawLanes();
    const rawLane = this.getRawElement(rawDump, lane);
    const rawLaneIdx = rawDump.indexOf(rawLane);

    rawDump.splice(rawLaneIdx, 1);
    rawDump.splice(rawLaneIdx + moveStep, 0, rawLane);

    return this.applyChange(rawDump);
  },

  moveBlock(block, moveStep) {
    const rawDump = this.dumpRawLanes();

    const rawParent = this.getRawElement(rawDump, get(block, 'parent'));
    if (rawParent) {
      const rawBlock = this.getRawElement(rawDump, block);
      const rawBlockIdx = rawParent.tasks.indexOf(rawBlock);
      rawParent.tasks.splice(rawBlockIdx, 1);
      rawParent.tasks.splice(rawBlockIdx + moveStep, 0, rawBlock);
    }

    return this.applyChange(rawDump);
  },

  clearLane(lane) {
    const rawDump = this.dumpRawLanes();

    const rawLane = this.getRawElement(rawDump, lane);
    rawLane.tasks.length = 0;

    return this.applyChange(rawDump);
  },

  removeLane(lane) {
    const rawDump = this.dumpRawLanes();

    const laneId = get(lane, 'id');
    const updatedRawDump = rawDump.filter(({ id }) => id !== laneId);

    return this.applyChange(updatedRawDump);
  },

  removeBlock(block) {
    const rawDump = this.dumpRawLanes();

    const rawParent = this.getRawElement(rawDump, get(block, 'parent'));
    if (rawParent) {
      const blockId = get(block, 'id');
      rawParent.tasks = rawParent.tasks.filter(({ id }) => id !== blockId);
    }

    return this.applyChange(rawDump);
  },

  applyChange(changedDump) {
    const onChange = this.get('onChange');
    if (onChange) {
      return resolve(onChange(changedDump));
    } else {
      return resolve();
    }
  },

  dumpRawLanes() {
    return _.cloneDeep(this.get('rawLanes'));
  },

  getRawElement(rawDump, element) {
    if (get(element, 'type') === 'lane') {
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

  actions: {
    horizonalScroll() {
      this.scheduleHorizontalOverflowDetection();
    },
    scrollLeft() {
      this.scrollToLane(this.get('scrollLeftNextLane'), 'left');
    },
    scrollRight() {
      this.scrollToLane(this.get('scrollRightNextLane'), 'right');
    },
  },
});
