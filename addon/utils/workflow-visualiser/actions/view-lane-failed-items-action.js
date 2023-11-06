/**
 * Shows failed items of specific lane. Needs `lane`, `runNumber` and `getStoreContentCallback`
 * passed via context. If `runNumber` is not provided, the visible one will be used.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Action from 'onedata-gui-common/utils/action';
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
   * @type {ComputedProperty<Array<string> | undefined>}
   */
  itemTraceIdsToHighlight: reads('context.itemTraceIdsToHighlight'),

  /**
   * @param {Utils.WorkflowVisualiser.Store} store
   * @type {ComputedProperty<Function>}
   */
  getStoreContentCallback: reads('context.getStoreContentCallback'),

  /**
   * @type {ComputedProperty<AtmValuePresenterContext | undefined>}
   */
  storeContentPresenterContext: reads('context.storeContentPresenterContext'),

  /**
   * @type {ComputedProperty<(store: Utils.WorkflowVisualiser.Store, traceIds: Array<string>) => Promise<Object>>}
   */
  convertTraceIdsToIndicesCallback: reads('context.convertTraceIdsToIndicesCallback'),

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
  async onExecute() {
    let indicesToHighlight;
    if (this.itemTraceIdsToHighlight?.length && this.convertTraceIdsToIndicesCallback) {
      try {
        const traceIdsToIndicesMap = await this.convertTraceIdsToIndicesCallback(
          this.exceptionStore,
          this.itemTraceIdsToHighlight
        );
        indicesToHighlight = this.itemTraceIdsToHighlight.reduce((acc, traceId) => {
          if (traceIdsToIndicesMap?.[traceId]) {
            acc.push(traceIdsToIndicesMap[traceId]);
          }
          return acc;
        }, []);
      } catch (error) {
        console.error(
          'Could not convert trace IDs to exception store indices due to error:',
          error
        );
      }
    }

    return this.modalManager
      .show('workflow-visualiser/store-modal', {
        mode: 'view',
        store: this.exceptionStore,
        getStoreContentCallback: (...args) =>
          this.getStoreContentCallback(this.exceptionStore, ...args),
        storeContentPresenterContext: this.storeContentPresenterContext,
        indicesToHighlight,
      }).hiddenPromise;
  },
});
