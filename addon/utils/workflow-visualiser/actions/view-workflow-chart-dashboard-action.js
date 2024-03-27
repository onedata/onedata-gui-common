/**
 * Shows workflow chart dashboard.
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
import { or } from 'ember-awesome-macros';
import {
  workflowEndedStatuses,
  workflowSuspendedStatuses,
} from 'onedata-gui-common/utils/workflow-visualiser/statuses';

export default Action.extend({
  modalManager: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.workflowVisualiser.workflow.actions.viewWorkflowChartDashboard',

  /**
   * @override
   */
  className: 'view-workflow-chart-dashboard-action-trigger',

  /**
   * @override
   */
  icon: 'overview',

  /**
   * @type {ComputedProperty<Utils.WorkflowVisualiser.Workflow>}
   */
  workflow: or('context.workflow.content', 'context.workflow'),

  /**
   * @type {ComputedProperty<(store: Utils.WorkflowVisualiser.Store, browseOptions: AtmStoreContentBrowseOptions) => Promise<AtmStoreContentBrowseResult|null>>}
   */
  getStoreContentCallback: reads('context.getStoreContentCallback'),

  /**
   * @type {ComputedProperty<() => AtmTimeSeriesCollectionReferencesMap>}
   */
  getTimeSeriesCollectionRefsMapCallback: reads(
    'context.getTimeSeriesCollectionRefsMapCallback'
  ),

  /**
   * @type {ComputedProperty<ObjectProxy<boolean>>}
   */
  isLiveProxy: computed('workflow.status', function isLiveProxy() {
    return ObjectProxy.extend({
      content: computed('action.workflow.status', function content() {
        return !workflowEndedStatuses.includes(this.action.workflow?.status) &&
          !workflowSuspendedStatuses.includes(this.action.workflow?.status);
      }),
    }).create({ action: this });
  }),

  /**
   * @override
   */
  async onExecute() {
    await this.modalManager.show('workflow-visualiser/charts-modal', {
      dashboardOwner: this.workflow,
      isLiveProxy: this.isLiveProxy,
      getStoreContentCallback: this.getStoreContentCallback,
      getTimeSeriesCollectionRefsMapCallback: this.getTimeSeriesCollectionRefsMapCallback,
    }).hiddenPromise;
  },
});
