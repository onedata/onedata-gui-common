/**
 * Shows store details. Needs store and (optionally) storeContentPresenterContext
 * passed via context.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Action from 'onedata-gui-common/utils/action';
import ActionResult from 'onedata-gui-common/utils/action-result';
import { set } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';

export default Action.extend({
  modalManager: service(),

  /**
   * @type {ComputedProperty<Utils.WorkflowVisualiser.Store>}
   */
  store: reads('context.store'),

  /**
   * @type {ComputedProperty<Utils.WorkflowVisualiser.ActionsFactory>}
   */
  actionsFactory: reads('context.actionsFactory'),

  /**
   * @type {ComputedProperty<Function>}
   */
  getStoreContentCallback: reads('context.getStoreContentCallback'),

  /**
   * @type {ComputedProperty<AtmValuePresenterContext | undefined>}
   */
  storeContentPresenterContext: reads('context.storeContentPresenterContext'),

  /**
   * @type {ComputedProperty<() => AtmTimeSeriesCollectionReferencesMap>}
   */
  getTimeSeriesCollectionRefsMapCallback: reads(
    'context.getTimeSeriesCollectionRefsMapCallback'
  ),

  /**
   * @override
   */
  onExecute() {
    const result = ActionResult.create();
    return this.modalManager
      .show('workflow-visualiser/store-modal', {
        mode: 'view',
        store: this.store,
        actionsFactory: this.actionsFactory,
        getStoreContentCallback: (...args) =>
          this.getStoreContentCallback(this.store, ...args),
        getTimeSeriesCollectionRefsMapCallback: (...args) =>
          this.getTimeSeriesCollectionRefsMapCallback(...args),
        storeContentPresenterContext: this.storeContentPresenterContext,
      }).hiddenPromise
      .then(() => {
        set(result, 'status', 'done');
        return result;
      });
  },
});
