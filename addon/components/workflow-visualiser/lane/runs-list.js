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
import { observer, get, computed } from '@ember/object';
import { next, later, cancel } from '@ember/runloop';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';

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
   * @virtual optional
   * @type {Number}
   */
  visibleRunsLimit: 5,

  /**
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

  runsArrayUpdater: observer(
    'runs',
    'visibleRunsLimit',
    function visibleRunsArraySetter() {
      this.scheduleRunsArrayUpdate();
    }
  ),

  init() {
    this._super(...arguments);

    this.setProperties({
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

  scheduleRunsArrayUpdate() {
    if (this.get('moveAnimationFsm.state') !== 'idle') {
      this.set('updateRunsArrayAfterAnimation', true);
    } else {
      this.updateRunsArray();
    }
  },

  updateRunsArray() {
    this.set(
      'runsArray',
      Object.values(this.get('runs') || {}).sortBy('runNo')
    );

    this.updateVisibleRunsArray();
  },

  updateVisibleRunsArray() {
    const {
      visibleRunsArray,
      visibleRunsLimit,
      runsArray,
    } = this.getProperties(
      'visibleRunsArray',
      'visibleRunsLimit',
      'runsArray'
    );

    if (!runsArray.length) {
      this.set('visibleRunsArray', []);
      return;
    }

    const newRunsNos = runsArray.mapBy('runNo');
    const firstVisibleRun = visibleRunsArray[0];
    const firstVisibleRunIdx = firstVisibleRun ?
      newRunsNos.indexOf(get(firstVisibleRun, 'runNo')) : -1;

    let newVisibleRunsArray;
    if (
      !firstVisibleRun ||
      firstVisibleRunIdx === -1 ||
      firstVisibleRunIdx + visibleRunsLimit >= runsArray.length
    ) {
      newVisibleRunsArray =
        getLastNArrayElements(runsArray, visibleRunsLimit);
    } else {
      newVisibleRunsArray = runsArray.slice(
        firstVisibleRunIdx,
        firstVisibleRunIdx + visibleRunsLimit
      );
    }

    this.set('visibleRunsArray', newVisibleRunsArray);
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
    if (this.get('updateRunsArrayAfterAnimation')) {
      this.set('updateRunsArrayAfterAnimation', false);
      this.updateRunsArray();
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

  actions: {
    showPrevRuns() {
      const {
        hiddenPrevRuns,
        visibleRunsLimit,
      } = this.getProperties(
        'hiddenPrevRuns',
        'visibleRunsLimit'
      );
      const moveStep = -Math.min(hiddenPrevRuns, visibleRunsLimit);
      if (moveStep === 0) {
        return;
      }
      this.scheduleActionOnAnimationFsm('addIndicators', { moveStep });
    },
    showNextRuns() {
      const {
        hiddenNextRuns,
        visibleRunsLimit,
      } = this.getProperties(
        'hiddenNextRuns',
        'visibleRunsLimit'
      );
      const moveStep = Math.min(hiddenNextRuns, visibleRunsLimit);
      if (moveStep === 0) {
        return;
      }
      this.scheduleActionOnAnimationFsm('addIndicators', { moveStep });
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
