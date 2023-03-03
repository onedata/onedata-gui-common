// TODO: VFS-9257 fix eslint issues in this file
/* eslint-disable max-len */

/**
 * Shows a list of lane runs.
 *
 * To synchronize data updates and move animations, component uses finite state
 * machine approach (FSM). It allows to postpone data updates until the animation end
 * to not break UX and to organize steps of the animation (which is not trivial).
 *
 * "Move animation" state machine:
 *
 *                             ┌──────────────────────────────────┐
 *                             │                                  │
 *                             │                                  │
 * ┌───────────────────────────▼────────────────────────────┐     │
 * │ State: idle                                            │     │
 * │                                                        │     │
 * │ Start state with no animation.                         │     │
 * └───────────────────────────┬────────────────────────────┘     │
 *                             │                                  │
 *                             │                                  │
 *                             │ addIndicators                    │
 *                             │                                  │
 *                             │                                  │
 * ┌───────────────────────────▼────────────────────────────┐     │
 * │ State: addingIndicators                                │     │
 * │                                                        │     │
 * │ Renders new indicators, that will become visible after │     │
 * │ animation. On the left side for "showPrevRuns"         │     │
 * │ and on the right side for "showNextRuns".              │     │
 * │ These new indicators are invisible (hidden due to      │     │
 * │ left/right overflow).                                  │     │
 * └───────────────────────────┬────────────────────────────┘     │
 *                             │                                  │
 *                             │                                  │
 *                             │ moveIndicators                   │ finishAnimation
 *                             │                                  │
 *                             │                                  │
 * ┌───────────────────────────▼────────────────────────────┐     │
 * │ State: movingIndicators                                │     │
 * │                                                        │     │
 * │ Applies position-related CSS to indicators to launch   │     │
 * │ transition animation. At the end indicators are        │     │
 * │ visible in their right places. Previous indicators     │     │
 * │ are hidden due to the overflow and new ones are in     │     │
 * │ a visible part of the list.                            │     │
 * └───────────────────────────┬────────────────────────────┘     │
 *                             │                                  │
 *                             │                                  │
 *                             │ removeIndicators                 │
 *                             │                                  │
 *                             │                                  │
 * ┌───────────────────────────▼────────────────────────────┐     │
 * │ State: removingIndicators                              │     │
 * │                                                        │     │
 * │ Removes indicators, that are no longer needed as       │     │
 * │ they are not visible due to an overflow.               │     │
 * └───────────────────────────┬────────────────────────────┘     │
 *                             │                                  │
 *                             │                                  │
 *                             │                                  │
 *                             └──────────────────────────────────┘
 *
 * Example of move FSM effects for "showNextRuns":
 *
 * 1. "idle" state
 *    Visible indicators at the end: | 1 2 3 4 5 |
 *    FSM receives (addIndicators moveStep=5)
 * 2. "addingIndicators" state
 *    Visible indicators at the end: | 1 2 3 4 5 | [6] [7] [8] [9] [10]
 *    FSM receives (moveIndicators moveStep=5)
 * 3. "movingIndicators" state
 *    Visible indicators at the end: [1] [2] [3] [4] [5] | 6 7 8 9 10 |
 *    FSM receives (removeIndicators moveStep=5)
 * 4. "removingIndicators" state
 *    Visible indicators at the end: | 6 7 8 9 10 |
 *    FSM receives (finishAnimation)
 * 5. "idle" state
 *    ... and so on
 *
 * For "showPrevRuns" moveStep parameter is negative.
 *
 * The information about next indicators position (which triggers animation FSM)
 * is passed via `visibleRunsPosition` parameter. It is an object, which has
 * two fields:
 * - `runNumber` - describes which run (and so other runs, which are near to it)
 *   should be positioned.
 * - `placement` - position of the `runNumber` in runs list. Possible values:
 *   `'start'`, `'center'`, `'end'`.
 *
 * Example: For visible indicators | 3 4 5 6 7 | triggering `showNextRuns`
 * would pass to the parent an information to change `visibleRunsPosition`
 * value to `{ runNumber: 12, placement: 'end' }` which means "scroll horizontally
 * as soon as run '12' will be visible on the right (end) edge".
 *
 * Due to updates of `runsRegistry` object, which can happen any time, actual list of
 * runs used in rendering and calculating animations is dumped to `runsArray`.
 * `runsArray` is of course updated on `runsRegistry` change but only in allowed time
 * frames to not break the animation. Also to prevent races with mixed animations
 * and updates, there is a queue of indicators position changes. It handles cases
 * when animation is being executed, but in the same time there is a `runsRegistry` update
 * and `visibleRunsPosition` update. In that case the existing animation is fully
 * finished, then new `runsArray` is generated and at the end the next animation
 * request (from `visibleRunsPosition` change) is processed.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from '../../../templates/components/workflow-visualiser/lane/runs-list';
import { observer, getProperties, computed } from '@ember/object';
import { next, later, cancel, scheduleOnce } from '@ember/runloop';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import { or, neq, array, raw } from 'ember-awesome-macros';
import { runsRegistryToSortedArray } from 'onedata-gui-common/utils/workflow-visualiser/run-utils';
import config from 'ember-get-config';

/**
 * @typedef {Object} RunsListVisibleRunsPosition
 * @property {AtmLaneRunNumber} runNumber
 * @property {String} placement one of: `'start'`, `'end'`, `'center'`
 */

export default Component.extend({
  layout,
  classNames: ['runs-list'],
  classNameBindings: ['isAnimating:is-animating'],

  /**
   * The same as `runsRegistry` field in Lane object.
   * @virtual
   * @type {Object}
   */
  runsRegistry: undefined,

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
   * @type {AtmLaneRunNumber|undefined}
   */
  selectedRunNumber: undefined,

  /**
   * @virtual optional
   * @type {Function}
   * @param {AtmLaneRunNumber} runNumber
   * @returns {any}
   */
  onSelectionChange: undefined,

  /**
   * @virtual optional
   * @type {Function}
   * @param {RunsListVisibleRunsPosition} visibleRunsPosition
   * @returns {any}
   */
  onVisibleRunsPositionChange: undefined,

  /**
   * Value of `runs` from latest render
   * @type {Object}
   */
  prevRunsRegistry: undefined,

  /**
   * Value of `visibleRunsPosition` from latest render
   * @type {RunsListVisibleRunsPosition}
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
   * Mapping: (runNumber: AtmLaneRunNumber) -> string
   * @type {Object}
   */
  visibleRunsStyles: undefined,

  /**
   * Mapping: (runNumber: AtmLaneRunNumber) -> string
   * @type {Object}
   */
  visibleRunsClasses: undefined,

  /**
   * @type {Boolean}
   */
  updateRunsArrayAfterAnimation: false,

  /**
   * @type {ComputedProperty<Boolean>}
   */
  isAnimating: or(
    neq('moveAnimationFsm.state', raw('idle')),
    neq('visibleRunsPositionChangesQueue.length', raw(0))
  ),

  /**
   * @type {ComputedProperty<Array<AtmLaneRunNumber>>}
   */
  runsNumbers: array.mapBy('runsArray', raw('runNumber')),

  /**
   * @type {ComputedProperty<Array<AtmLaneRunNumber>>}
   */
  visibleRunsNos: array.mapBy('visibleRunsArray', raw('runNumber')),

  /**
   * @type {ComputedProperty<Number>}
   */
  hiddenPrevRunsCount: computed(
    'visibleRunsArray',
    'runsArray',
    function hiddenPrevRunsCount() {
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
  hiddenNextRunsCount: computed(
    'visibleRunsArray',
    'runsArray',
    function hiddenNextRunsCount() {
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
    'runsRegistry',
    'visibleRunsLimit',
    'visibleRunsPosition',
    function runsAndPositionUpdater() {
      scheduleOnce('afterRender', this, 'updateRunsAndPosition');
    }
  ),

  init() {
    this._super(...arguments);

    const {
      runsRegistry,
      visibleRunsPosition,
    } = this.getProperties('runsRegistry', 'visibleRunsPosition');
    this.setProperties({
      prevRunsRegistry: runsRegistry,
      prevVisibleRunsPosition: visibleRunsPosition,
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
      runsRegistry,
      prevRunsRegistry,
      visibleRunsPosition,
      prevVisibleRunsPosition,
    } = this.getProperties(
      'runsRegistry',
      'prevRunsRegistry',
      'visibleRunsPosition',
      'prevVisibleRunsPosition'
    );
    if (runsRegistry !== prevRunsRegistry) {
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
    const runsRegistry = this.get('runsRegistry') || {};
    this.setProperties({
      runsArray: runsRegistryToSortedArray(runsRegistry),
      prevRunsRegistry: runsRegistry,
    });

    this.updateVisibleRunsArray();
  },

  updateVisibleRunsArray() {
    let activeVisibleRunsPosition = this.get('activeVisibleRunsPosition');
    if (!activeVisibleRunsPosition) {
      const runsNumbers = this.get('runsNumbers');
      activeVisibleRunsPosition = this.set('activeVisibleRunsPosition', {
        runNumber: runsNumbers[runsNumbers.length - 1],
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
      runsNumbers,
    } = this.getProperties(
      'visibleRunsLimit',
      'runsArray',
      'runsNumbers'
    );

    if (!runsArray.length) {
      return [];
    }

    const {
      runNumber: positionedRunNumber,
      placement,
    } = getProperties(visibleRunsPosition || {}, 'runNumber', 'placement');

    const positionedRunNumberIdx = runsNumbers.indexOf(positionedRunNumber);
    if (positionedRunNumberIdx === -1) {
      return runsArray.slice(-visibleRunsLimit);
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

    const availableRunsOnTheLeft = runsArray.slice(0, positionedRunNumberIdx);
    const availableRunsOnTheRight = runsArray.slice(positionedRunNumberIdx + 1);
    const runsToAddOnTheLeft = availableRunsOnTheLeft.splice(
      Math.max(0, availableRunsOnTheLeft.length - slotsOnTheLeft)
    );
    const runsToAddOnTheRight = availableRunsOnTheRight.splice(0, slotsOnTheRight);
    if (runsToAddOnTheLeft.length < slotsOnTheLeft) {
      const extraSlotsOnTheRight = slotsOnTheLeft - runsToAddOnTheLeft.length;
      runsToAddOnTheRight.push(...availableRunsOnTheRight.splice(0, extraSlotsOnTheRight));
    } else if (runsToAddOnTheRight.length < slotsOnTheRight) {
      const extraSlotsOnTheLeft = slotsOnTheRight - runsToAddOnTheRight.length;
      runsToAddOnTheLeft.push(...availableRunsOnTheLeft.splice(
        Math.max(0, availableRunsOnTheLeft.length - extraSlotsOnTheLeft)
      ));
    }
    return [
      ...runsToAddOnTheLeft,
      runsArray[positionedRunNumberIdx],
      ...runsToAddOnTheRight,
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

    this.set('visibleRunsPositionChangesQueue', [
      ...visibleRunsPositionChangesQueue,
      visibleRunsPosition,
    ]);
    if (shouldApplyPositionNow) {
      this.applyNextVisibleRunsPosition();
    }
  },

  applyNextVisibleRunsPosition() {
    const {
      visibleRunsPositionChangesQueue,
      visibleRunsArray,
      runsNumbers,
    } = this.getProperties(
      'visibleRunsPositionChangesQueue',
      'visibleRunsArray',
      'runsNumbers'
    );
    const nextVisibleRunsPosition = visibleRunsPositionChangesQueue[0];
    if (!nextVisibleRunsPosition || !visibleRunsArray.length) {
      return;
    }

    const newVisibleRunsArray =
      this.calculateVisibleRunsForPosition(nextVisibleRunsPosition);
    if (
      !newVisibleRunsArray.length ||
      visibleRunsArray[0].runNumber === newVisibleRunsArray[0].runNumber
    ) {
      // Incorrect/non-changing position, finish this animation.
      this.runAfterAnimationHooks();
      return;
    }

    const firstVisibleRunIdx = runsNumbers.indexOf(visibleRunsArray[0].runNumber);
    const newFirstVisibleRunIdx = runsNumbers.indexOf(newVisibleRunsArray[0].runNumber);
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
      default:
        console.warn(
          `component:workfow-visualiser/lane/runs-list#performActionOnAnimationFsm: ignoring unknown animation state "${state}".`
        );
        return;
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
    const newVisibleRunsPositionChangesQueue = this.set(
      'visibleRunsPositionChangesQueue',
      visibleRunsPositionChangesQueue.slice(1)
    );
    // Run next position change if needed
    if (newVisibleRunsPositionChangesQueue.length) {
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
    const newVisibleRunsStyles = {};
    const newVisibleRunsClasses = {};
    let addedRuns = [];
    if (moveStep < 0) {
      addedRuns = runsArray.slice(
        firstVisibleRunIdx + moveStep,
        firstVisibleRunIdx
      );
      newVisibleRunsArray = [...addedRuns, ...visibleRunsArray];
      addedRuns.forEach((run, idx) => {
        newVisibleRunsStyles[run.runNumber] =
          `left: -${(addedRuns.length - idx) * runIndicatorWidth}px`;
      });
    } else {
      addedRuns = runsArray.slice(
        firstVisibleRunIdx + visibleRunsArray.length,
        firstVisibleRunIdx + visibleRunsArray.length + moveStep
      );
      newVisibleRunsArray = [...visibleRunsArray, ...addedRuns];
      addedRuns.forEach((run, idx) => {
        newVisibleRunsStyles[run.runNumber] =
          `right: -${(idx + 1) * runIndicatorWidth}px`;
      });
    }
    addedRuns.forEach((run) =>
      newVisibleRunsClasses[run.runNumber] = 'animated new-item'
    );
    visibleRunsArray.forEach(run => {
      newVisibleRunsStyles[run.runNumber] = 'left: 0; right: 0';
      newVisibleRunsClasses[run.runNumber] = 'animated';
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
        newVisibleRunsStyles[run.runNumber] = `left: ${idx * runIndicatorWidth}px`;
      });
      existingRuns.forEach((run) => {
        newVisibleRunsStyles[run.runNumber] =
          `left: ${(-moveStep) * runIndicatorWidth}px`;
      });
    } else {
      const newRuns = visibleRunsArray.slice(-moveStep);
      const existingRuns = visibleRunsArray.slice(0, -moveStep);
      newRuns.forEach((run, idx) => {
        newVisibleRunsStyles[run.runNumber] =
          `right: ${(newRuns.length - idx - 1) * runIndicatorWidth}px`;
      });
      existingRuns.forEach((run) => {
        newVisibleRunsStyles[run.runNumber] =
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
    transitionTimeoutTimerId = later(
      endTransitionHandler,
      config.environment === 'test' ? 1 : 400
    );
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

  notifyVisibleRunsPositionChange(newVisibleRunsPosition) {
    const onVisibleRunsPositionChange = this.get('onVisibleRunsPositionChange');
    if (onVisibleRunsPositionChange && newVisibleRunsPosition) {
      onVisibleRunsPositionChange(newVisibleRunsPosition);
    }
  },

  notifySelectionChange(newSelectedRunNumber) {
    const onSelectionChange = this.get('onSelectionChange');
    if (onSelectionChange) {
      onSelectionChange(newSelectedRunNumber);
    }
  },

  actions: {
    showPrevRuns() {
      const {
        visibleRunsLimit,
        runsNumbers,
        visibleRunsNos,
      } = this.getProperties('visibleRunsLimit', 'runsNumbers', 'visibleRunsNos');

      const firstVisibleRunIdx = runsNumbers.indexOf(visibleRunsNos[0]);
      const newFirstVisibleRunIdx =
        Math.max(firstVisibleRunIdx - visibleRunsLimit, 0);

      if (newFirstVisibleRunIdx === firstVisibleRunIdx) {
        return;
      }

      this.notifyVisibleRunsPositionChange({
        runNumber: runsNumbers[newFirstVisibleRunIdx],
        placement: 'start',
      });
    },
    showNextRuns() {
      const {
        visibleRunsLimit,
        runsNumbers,
        visibleRunsNos,
      } = this.getProperties('visibleRunsLimit', 'runsNumbers', 'visibleRunsNos');

      const lastVisibleRunIdx =
        runsNumbers.indexOf(visibleRunsNos[visibleRunsNos.length - 1]);
      const newLastVisibleRunIdx =
        Math.min(lastVisibleRunIdx + visibleRunsLimit, runsNumbers.length - 1);

      if (newLastVisibleRunIdx === lastVisibleRunIdx) {
        return;
      }

      this.notifyVisibleRunsPositionChange({
        runNumber: runsNumbers[newLastVisibleRunIdx],
        placement: 'end',
      });
    },
    selectRun(runNumber) {
      this.notifySelectionChange(runNumber);
    },
  },
});
