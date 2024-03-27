/**
 * Shows lane chart dashboard.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Action from 'onedata-gui-common/utils/action';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import ObjectProxy from '@ember/object/proxy';
import {
  laneEndedStatuses,
  laneSuspendedStatuses,
} from 'onedata-gui-common/utils/workflow-visualiser/statuses';

export default Action.extend({
  modalManager: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.workflowVisualiser.lane.actions.viewLaneChartDashboard',

  /**
   * @override
   */
  className: 'view-lane-chart-dashboard-action-trigger',

  /**
   * @override
   */
  icon: 'overview',

  /**
   * @type {ComputedProperty<Utils.WorkflowVisualiser.Lane>}
   */
  lane: reads('context.lane'),

  /**
   * @type {ComputedProperty<Utils.WorkflowVisualiser.Lane>}
   */
  runNumber: reads('context.runNumber'),

  /**
   * @type {ComputedProperty<(store: Utils.WorkflowVisualiser.Store, browseOptions: AtmStoreContentBrowseOptions) => Promise<AtmStoreContentBrowseResult|null>>}
   */
  getStoreContentCallback: reads('context.getStoreContentCallback'),

  /**
   * @type {ComputedProperty<(runNumber: number) => AtmTimeSeriesCollectionReferencesMap>}
   */
  getTimeSeriesCollectionRefsMapCallback: reads(
    'context.getTimeSeriesCollectionRefsMapCallback'
  ),

  /**
   * @type {ComputedProperty<ObjectProxy<boolean>>}
   */
  isLiveProxy: computed('lane.status', function isLiveProxy() {
    return ObjectProxy.extend({
      content: computed('action.lane.status', function content() {
        return !laneEndedStatuses.includes(this.action.lane?.status) &&
          !laneSuspendedStatuses.includes(this.action.lane?.status);
      }),
    }).create({ action: this });
  }),

  /**
   * @override
   */
  async onExecute() {
    await this.modalManager.show('workflow-visualiser/charts-modal', {
      dashboardOwner: this.lane,
      isLiveProxy: this.isLiveProxy,
      getStoreContentCallback: this.getStoreContentCallback,
      getTimeSeriesCollectionRefsMapCallback: () =>
        this.getTimeSeriesCollectionRefsMapCallback(this.runNumber),
    }).hiddenPromise;
  },
});
