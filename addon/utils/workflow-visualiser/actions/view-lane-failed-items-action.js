/**
 * Shows failed items of specific lane. Needs `lane`, `runNumber` and `getStoreContentCallback`
 * passed via context. If `runNumber` is not provided, the visible one will be used.
 *
 * @module utils/workflow-visualiser/actions/view-lane-failed-items-action
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Action from 'onedata-gui-common/utils/action';
import ActionResult from 'onedata-gui-common/utils/action-result';
import { set } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import {
  isEmpty,
  conditional,
  getBy,
  raw,
  or,
} from 'ember-awesome-macros';
import computedT from 'onedata-gui-common/utils/computed-t';

export default Action.extend({
  modalManager: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.workflowVisualiser.lane.actions.viewLaneFailedItems',

  /**
   * @override
   */
  className: 'view-lane-failed-items-action-trigger',

  /**
   * @override
   */
  icon: 'warning',

  /**
   * @override
   */
  disabled: isEmpty('exceptionStore'),

  /**
   * @override
   */
  tip: conditional(
    'disabled',
    computedT('disabledTip'),
    raw(null)
  ),

  /**
   * @type {ComputedProperty<Utils.WorkflowVisualiser.Lane>}
   */
  lane: reads('context.lane'),

  /**
   * @type {ComputedProperty<AtmLaneRunNumber>}
   */
  runNumber: reads('context.runNumber'),

  /**
   * @param {Utils.WorkflowVisualiser.Store} store
   * @type {ComputedProperty<Function>}
   */
  getStoreContentCallback: reads('context.getStoreContentCallback'),

  /**
   * @type {ComputedProperty<Object>}
   */
  run: conditional(
    'runNumber',
    getBy('lane.runsRegistry', 'runNumber'),
    'lane.visibleRun'
  ),

  /**
   * @type {ComputedProperty<Utils.WorkflowVisualiser.Store|undefined>}
   */
  exceptionStore: or('run.exceptionStore', raw(null)),

  /**
   * @override
   */
  onExecute() {
    const {
      exceptionStore,
      getStoreContentCallback,
      modalManager,
    } = this.getProperties(
      'exceptionStore',
      'getStoreContentCallback',
      'modalManager'
    );

    const result = ActionResult.create();
    return modalManager
      .show('workflow-visualiser/store-modal', {
        mode: 'view',
        store: exceptionStore,
        getStoreContentCallback: (...args) =>
          getStoreContentCallback(exceptionStore, ...args),
      }).hiddenPromise
      .then(() => {
        set(result, 'status', 'done');
        return result;
      });
  },
});
