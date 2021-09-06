/**
 * Shows a list of lane runs.
 *
 * @module components/workflow-visualiser/lane/runs-list
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from '../../../templates/components/workflow-visualiser/lane/runs-list';
import { observer, getProperties, computed } from '@ember/object';
import { next, later, cancel } from '@ember/runloop';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import { scheduleOnce } from '@ember/runloop';

/**
 * @typedef {Object} RunsListVisibleRunsPosition
 * @property {Number} runNo
 * @property {String} placement one of: `'start'`, `'end'`, `'center'`
 */

export default Component.extend({
  layout,
  classNames: ['runs-list'],

  /**
   * The same as `runs` field in Lane object.
   * @virtual
   * @type {Object}
   */
  runs: undefined,

  /**
   * @virtual
   * @type {RunsListVisibleRunsPosition}
   */
  visibleRunsPosition: undefined,

  /**
   * @virtual optional
   * @type {Number}
   */
  visibleRunsLimit: 5,

  /**
   * @virtual optional
   * @type {Number|undefined}
   */
  selectedRunNo: undefined,

  /**
   * @type {Function}
   * @param {Number} runNo
   * @returns {any}
   */
  onSelectionChange: undefined,

  /**
   * @type {Function}
   * @param {RunsListVisibleRunsPosition} visibleRunsPosition
   * @returns {any}
   */
  onVisibleRunsPositionChange: undefined,

  /**
   * Value of `runs` from latest render
   * @type {Object}
   */
  prevRuns: undefined,

  /**
   *Value of `visibleRunsPosition` from latest render
   */
  prevVisibleRunsPosition: undefined,

  /**
   * @type {Number}
   */
  runIndicatorWidth: 35,

  /**
   * @type {{ state: String, data: Object }}
   */
  moveAnimationFsm: undefined,

  /**
   * @type {Array<Object>}
   */
  runsArray: undefined,

  /**
   * @type {RunsListVisibleRunsPosition}
   */
  activeVisibleRunsPosition: undefined,

  /**
   * @type {Array<RunsListVisibleRunsPosition>}
   */
  visibleRunsPositionChangesQueue: undefined,

  /**
   * @type {Array<Object>}
   */
  visibleRunsArray: undefined,

  /**
   * Mapping: (runNo: number) -> string
   * @type {Object}
   */
  visibleRunsStyles: undefined,

  /**
   * Mapping: (runNo: number) -> string
   * @type {Object}
   */
  visibleRunsClasses: undefined,

  /**
   * @type {Boolean}
   */
  updateRunsArrayAfterAnimation: false,

  /**
   * @type {ComputedProperty<Number>}
   */
  hiddenPrevRuns: computed(
    'visibleRunsArray',
    'runsArray',
    function hiddenNextRuns() {
      const {
        visibleRunsArray,
        runsArray,
      } = this.getProperties('visibleRunsArray', 'runsArray');
      return Math.max(runsArray.indexOf(visibleRunsArray[0]), 0);
    }
  ),

  /**
   * @type {ComputedProperty<Number>}
   */
  hiddenNextRuns: computed(
    'visibleRunsArray',
    'runsArray',
    function hiddenNextRuns() {
      const {
        visibleRunsArray,
        runsArray,
      } = this.getProperties('visibleRunsArray', 'runsArray');

      const lastVisibleRunIdx = runsArray.indexOf(
        visibleRunsArray[visibleRunsArray.length - 1]
      );
      return lastVisibleRunIdx !== -1 ?
        runsArray.length - lastVisibleRunIdx - 1 : 0;
    }
  ),

  runsAndPositionUpdater: observer(
    'runs',
    'visibleRunsLimit',
    'visibleRunsPosition',
    function runsAndPositionUpdater() {
      scheduleOnce('afterRender', this, 'updateRunsAndPosition');
    }
  ),

  init() {
    this._super(...arguments);

    const {
      runs,
      visibleRunsPosition,
    } = this.getProperties('visibleRunsPosition');
    this.setProperties({
      prevRuns: runs,
      prevVisibleRunsPosition: visibleRunsPosition,
      activeVisibleRunsPosition: this.generateInitialActiveVisibleRunsPosition(),
      visibleRunsPositionChangesQueue: [],
      moveAnimationFsm: {
        state: 'idle',
        data: {},
      },
      visibleRunsArray: [],
      visibleRunsStyles: {},
      visibleRunsClasses: {},
    });
    this.updateRunsArray();
  },

  updateRunsAndPosition() {
    const {
      runs,
      prevRuns,
      visibleRunsPosition,
      prevVisibleRunsPosition,
    } = this.getProperties(
      'runs',
      'prevRuns',
      'visibleRunsPosition',
      'prevVisibleRunsPosition'
    );
    if (runs !== prevRuns) {
      this.scheduleRunsArrayUpdate();
    }
    if (visibleRunsPosition !== prevVisibleRunsPosition) {
      this.scheduleVisibleRunsPositionChange();
    }
  },

  scheduleRunsArrayUpdate() {
    if (this.get('moveAnimationFsm.state') !== 'idle') {
      this.set('updateRunsArrayAfterAnimation', true);
    } else {
      this.updateRunsArray();
    }
  },

  updateRunsArray() {
    const runs = this.get('runs');
    this.setProperties({
      runsArray: this.generateRunsArray(),
      prevRuns: runs,
    });

    this.updateVisibleRunsArray();
  },

  updateVisibleRunsArray() {
    let activeVisibleRunsPosition = this.get('activeVisibleRunsPosition');
    if (!activeVisibleRunsPosition) {
      activeVisibleRunsPosition = this.set('activeVisibleRunsPosition', {
        runNo: this.getRunsNos().reverse()[0],
        placement: 'end',
      });
    }
    this.set(
      'visibleRunsArray',
      this.calculateVisibleRunsForPosition(activeVisibleRunsPosition)
    );
  },

  calculateVisibleRunsForPosition(visibleRunsPosition) {
    const {
      visibleRunsLimit,
      runsArray,
    } = this.getProperties(
      'visibleRunsLimit',
      'runsArray'
    );

    if (!runsArray.length) {
      return [];
    }

    const {
      runNo: positionedRunNo,
      placement,
    } = getProperties(visibleRunsPosition || {}, 'runNo', 'placement');

    const runsNos = this.getRunsNos();
    const positionedRunNoIdx = runsNos.indexOf(positionedRunNo);
    if (positionedRunNoIdx === -1) {
      return getLastNArrayElements(runsArray, visibleRunsLimit);
    }
    let slotsOnTheLeft;
    let slotsOnTheRight;
    if (placement === 'start') {
      slotsOnTheLeft = 0;
      slotsOnTheRight = visibleRunsLimit - 1;
    } else if (placement === 'end') {
      slotsOnTheLeft = visibleRunsLimit - 1;
      slotsOnTheRight = 0;
    } else {
      slotsOnTheLeft = Math.floor(visibleRunsLimit / 2);
      slotsOnTheRight = Math.floor((visibleRunsLimit - 1) / 2);
    }

    const leftRunsOnTheLeft = runsArray.slice(0, positionedRunNoIdx);
    const leftRunsOnTheRight = runsArray.slice(positionedRunNoIdx + 1);
    const leftRunsToAdd = leftRunsOnTheLeft.splice(
      Math.max(0, leftRunsOnTheLeft.length - slotsOnTheLeft)
    );
    const rightRunsToAdd = leftRunsOnTheRight.splice(0, slotsOnTheRight);
    if (leftRunsToAdd.length < slotsOnTheLeft) {
      const extraSlotsOnTheRight = slotsOnTheLeft - leftRunsToAdd.length;
      rightRunsToAdd.push(...leftRunsOnTheRight.splice(0, extraSlotsOnTheRight));
    } else if (rightRunsToAdd.length < slotsOnTheRight) {
      const extraSlotsOnTheLeft = slotsOnTheRight - rightRunsToAdd.length;
      leftRunsToAdd.push(...leftRunsOnTheLeft.splice(
        Math.max(0, leftRunsOnTheLeft.length - extraSlotsOnTheLeft)
      ));
    }
    return [
      ...leftRunsToAdd,
      runsArray[positionedRunNoIdx],
      ...rightRunsToAdd,
    ];
  },

  scheduleVisibleRunsPositionChange() {
    const {
      visibleRunsPosition,
      visibleRunsPositionChangesQueue,
    } = this.getProperties(
      'visibleRunsPosition',
      'visibleRunsPositionChangesQueue'
    );
    this.set('prevVisibleRunsPosition', visibleRunsPosition);
    const shouldApplyPositionNow =
      visibleRunsPositionChangesQueue.length === 0 &&
      this.get('moveAnimationFsm.state') === 'idle';

    visibleRunsPositionChangesQueue.push(visibleRunsPosition);
    if (shouldApplyPositionNow) {
      this.applyNextVisibleRunsPosition();
    }
  },

  applyNextVisibleRunsPosition() {
    const {
      visibleRunsPositionChangesQueue,
      visibleRunsArray,
    } = this.getProperties(
      'visibleRunsPositionChangesQueue',
      'visibleRunsArray'
    );
    const nextVisibleRunsPosition = visibleRunsPositionChangesQueue[0];
    if (!nextVisibleRunsPosition || !visibleRunsArray.length) {
      return;
    }

    const newVisibleRunsArray =
      this.calculateVisibleRunsForPosition(nextVisibleRunsPosition);
    if (
      !newVisibleRunsArray.length ||
      visibleRunsArray[0].runNo === newVisibleRunsArray[0].runNo
    ) {
      // Incorrect/non-changing position, finish this animation.
      this.runAfterAnimationHooks();
      return;
    }

    const runsNos = this.getRunsNos();
    const firstVisibleRunIdx = runsNos.indexOf(visibleRunsArray[0].runNo);
    const newFirstVisibleRunIdx = runsNos.indexOf(newVisibleRunsArray[0].runNo);
    const moveStep = newFirstVisibleRunIdx - firstVisibleRunIdx;

    this.set('activeVisibleRunsPosition', nextVisibleRunsPosition);
    this.scheduleActionOnAnimationFsm('addIndicators', { moveStep });
  },

  performActionOnAnimationFsm(actionName, actionData) {
    const {
      state,
      data,
    } = this.get('moveAnimationFsm');

    let nextState = state;
    let nextData = data;
    switch (state) {
      case 'idle':
        if (actionName === 'addIndicators') {
          nextState = 'addingIndicators';
          nextData = {
            moveStep: (actionData || {}).moveStep || 1,
          };
        }
        break;
      case 'addingIndicators':
        if (actionName === 'moveIndicators') {
          nextState = 'movingIndicators';
        }
        break;
      case 'movingIndicators':
        if (actionName === 'removeIndicators') {
          nextState = 'removingIndicators';
        }
        break;
      case 'removingIndicators':
        if (actionName === 'finishAnimation') {
          nextState = 'idle';
          nextData = {};
        }
        break;
    }

    if (nextState !== state) {
      this.set('moveAnimationFsm', { state: nextState, data: nextData });
      switch (nextState) {
        case 'idle':
          this.runAfterAnimationHooks();
          break;
        case 'addingIndicators':
          this.addIndicators(nextData.moveStep);
          break;
        case 'movingIndicators':
          this.moveIndicators(nextData.moveStep);
          break;
        case 'removingIndicators':
          this.removeIndicators(nextData.moveStep);
          break;
      }
    }
  },

  scheduleActionOnAnimationFsm(actionName, actionData) {
    // Moving animation state change to the next runloop frame as some of the
    // animation steps needs to be rendered first.
    next(() => {
      // Using requestAnimationFrame to be sure, that changes are painted in the
      // browser. Without this callback, chrome-like browsers sometimes break
      // down transition animations.
      window.requestAnimationFrame(() => {
        safeExec(this, () => {
          this.performActionOnAnimationFsm(actionName, actionData);
        });
      });
    });
  },

  runAfterAnimationHooks() {
    const {
      updateRunsArrayAfterAnimation,
      visibleRunsPositionChangesQueue,
    } = this.getProperties(
      'updateRunsArrayAfterAnimation',
      'visibleRunsPositionChangesQueue'
    );
    if (updateRunsArrayAfterAnimation) {
      this.set('updateRunsArrayAfterAnimation', false);
      this.updateRunsArray();
    }
    // Remove position change that has been just applied.
    visibleRunsPositionChangesQueue.shift();
    // Run next position change if needed
    if (visibleRunsPositionChangesQueue.length) {
      this.applyNextVisibleRunsPosition();
    }
  },

  addIndicators(moveStep) {
    const {
      runIndicatorWidth,
      runsArray,
      visibleRunsArray,
    } = this.getProperties(
      'runIndicatorWidth',
      'runsArray',
      'visibleRunsArray'
    );

    const firstVisibleRunIdx = runsArray.indexOf(visibleRunsArray[0]);
    let newVisibleRunsArray;
    let newVisibleRunsStyles = {};
    let newVisibleRunsClasses = {};
    let addedRuns = [];
    if (moveStep < 0) {
      addedRuns = runsArray.slice(
        firstVisibleRunIdx + moveStep,
        firstVisibleRunIdx
      );
      newVisibleRunsArray = [...addedRuns, ...visibleRunsArray];
      addedRuns.forEach((run, idx) => {
        newVisibleRunsStyles[run.runNo] =
          `left: -${(addedRuns.length - idx) * runIndicatorWidth}px`;
      });
    } else {
      addedRuns = runsArray.slice(
        firstVisibleRunIdx + visibleRunsArray.length,
        firstVisibleRunIdx + visibleRunsArray.length + moveStep
      );
      newVisibleRunsArray = [...visibleRunsArray, ...addedRuns];
      addedRuns.forEach((run, idx) => {
        newVisibleRunsStyles[run.runNo] =
          `right: -${(idx + 1) * runIndicatorWidth}px`;
      });
    }
    addedRuns.forEach((run) =>
      newVisibleRunsClasses[run.runNo] = 'animated new-item'
    );
    visibleRunsArray.forEach(run => {
      newVisibleRunsStyles[run.runNo] = 'left: 0; right: 0';
      newVisibleRunsClasses[run.runNo] = 'animated';
    });
    this.setProperties({
      visibleRunsArray: newVisibleRunsArray,
      visibleRunsStyles: newVisibleRunsStyles,
      visibleRunsClasses: newVisibleRunsClasses,
    });
    this.scheduleActionOnAnimationFsm('moveIndicators', { moveStep });
  },

  moveIndicators(moveStep) {
    const {
      runIndicatorWidth,
      visibleRunsArray,
      element,
    } = this.getProperties('runIndicatorWidth', 'visibleRunsArray', 'element');

    const newVisibleRunsStyles = {};
    if (moveStep < 0) {
      const newRuns = visibleRunsArray.slice(0, -moveStep);
      const existingRuns = visibleRunsArray.slice(-moveStep);
      newRuns.forEach((run, idx) => {
        newVisibleRunsStyles[run.runNo] = `left: ${idx * runIndicatorWidth}px`;
      });
      existingRuns.forEach((run) => {
        newVisibleRunsStyles[run.runNo] =
          `left: ${(-moveStep) * runIndicatorWidth}px`;
      });
    } else {
      const newRuns = getLastNArrayElements(visibleRunsArray, moveStep);
      const existingRuns = visibleRunsArray.slice(0, -moveStep);
      newRuns.forEach((run, idx) => {
        newVisibleRunsStyles[run.runNo] =
          `right: ${(newRuns.length - idx - 1) * runIndicatorWidth}px`;
      });
      existingRuns.forEach((run) => {
        newVisibleRunsStyles[run.runNo] =
          `right: ${moveStep * runIndicatorWidth}px`;
      });
    }
    this.set('visibleRunsStyles', newVisibleRunsStyles);

    let transitionTimeoutTimerId;
    const endTransitionHandler = (event) => {
      if (
        event &&
        (event.propertyName !== 'left' && event.propertyName !== 'right')
      ) {
        return;
      }
      cancel(transitionTimeoutTimerId);
      element.removeEventListener('transitionend', endTransitionHandler);
      element.removeEventListener('transitioncancel', endTransitionHandler);
      this.scheduleActionOnAnimationFsm('removeIndicators', { moveStep });
    };
    transitionTimeoutTimerId = later(endTransitionHandler, 400);
    element.addEventListener('transitionend', endTransitionHandler);
    element.addEventListener('transitioncancel', endTransitionHandler);
  },

  removeIndicators(moveStep) {
    const visibleRunsArray = this.get('visibleRunsArray');

    let newVisibleRunsArray;
    if (moveStep < 0) {
      newVisibleRunsArray = visibleRunsArray.slice(0, moveStep);
    } else {
      newVisibleRunsArray = visibleRunsArray.slice(moveStep);
    }

    this.setProperties({
      visibleRunsArray: newVisibleRunsArray,
      visibleRunsStyles: {},
      visibleRunsClasses: {},
    });
    this.scheduleActionOnAnimationFsm('finishAnimation');
  },

  generateInitialActiveVisibleRunsPosition() {
    // If user passed initial value, then return it.
    const visibleRunsPosition = this.get('visibleRunsPosition');
    if (visibleRunsPosition) {
      return visibleRunsPosition;
    }

    const lastRunNo = this.generateRunsArray().mapBy('runNo').reverse()[0];
    return {
      runNo: lastRunNo,
      placement: 'end',
    };
  },

  generateRunsArray() {
    return Object.values(this.get('runs') || {}).sortBy('runNo');
  },

  getRunsNos() {
    return this.get('runsArray').mapBy('runNo');
  },

  getVisibleRunsNos() {
    return (this.get('visibleRunsArray') || []).mapBy('runNo');
  },

  actions: {
    showPrevRuns() {
      const {
        onVisibleRunsPositionChange,
        visibleRunsLimit,
      } = this.getProperties(
        'onVisibleRunsPositionChange',
        'visibleRunsLimit'
      );
      if (!onVisibleRunsPositionChange) {
        return;
      }

      const runsNos = this.getRunsNos();
      const visibleRunsNos = this.getVisibleRunsNos();
      const firstVisibleRunIdx = runsNos.indexOf(visibleRunsNos[0]);
      const newFirstVisibleRunIdx =
        Math.max(firstVisibleRunIdx - visibleRunsLimit, 0);

      if (newFirstVisibleRunIdx === firstVisibleRunIdx) {
        return;
      }

      onVisibleRunsPositionChange({
        runNo: runsNos[newFirstVisibleRunIdx],
        placement: 'start',
      });
    },
    showNextRuns() {
      const {
        onVisibleRunsPositionChange,
        visibleRunsLimit,
      } = this.getProperties(
        'onVisibleRunsPositionChange',
        'visibleRunsLimit'
      );
      if (!onVisibleRunsPositionChange) {
        return;
      }

      const runsNos = this.getRunsNos();
      const visibleRunsNos = this.getVisibleRunsNos();
      const lastVisibleRunIdx =
        runsNos.indexOf(visibleRunsNos[visibleRunsNos.length - 1]);
      const newLastVisibleRunIdx =
        Math.min(lastVisibleRunIdx + visibleRunsLimit, runsNos.length - 1);

      if (newLastVisibleRunIdx === lastVisibleRunIdx) {
        return;
      }

      onVisibleRunsPositionChange({
        runNo: runsNos[newLastVisibleRunIdx],
        placement: 'end',
      });
    },
    runSelected(runNo) {
      const onSelectionChange = this.get('onSelectionChange');
      onSelectionChange && onSelectionChange(runNo);
    },
  },
});

function getLastNArrayElements(arr, n) {
  return arr.slice(Math.max(arr.length - n, 0));
}
