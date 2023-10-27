/**
 * A modal that allows to view and modify charts dashboard.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import layout from 'onedata-gui-common/templates/components/modals/workflow-visualiser/charts-modal';
import { reads } from '@ember/object/computed';
import { trySet } from '@ember/object';
/**
 * @typedef {Object} WorkflowVisualiserChartsModalOptions
 * @property {'edit'|'view'} mode
 * @property {'lane'|'workflow'} dashboardOwnerType
 * @property {EmberObject} dashboardOwner
 * @property {ObjectProxy<boolean>} isLiveProxy Needed only in `view` mode
 * @property {(store: Utils.WorkflowVisualiser.Store, browseOptions: AtmStoreContentBrowseOptions) => Promise<AtmStoreContentBrowseResult|null>} getStoreContentCallback Needed only in `view` mode
 * @property {() => AtmTimeSeriesCollectionReferencesMap} getTimeSeriesCollectionRefsMapCallback Needed only in `view` mode
 */

export default Component.extend(I18n, {
  layout,
  tagName: '',

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.modals.workflowVisualiser.chartsModal',

  /**
   * @virtual
   * @type {string}
   */
  modalId: undefined,

  /**
   * @virtual
   * @type {WorkflowVisualiserChartsModalOptions}
   */
  modalOptions: undefined,

  /**
   * Initial value is set on init
   * @type {'visualisation'|'definition'}
   */
  activeTab: undefined,

  /**
   * @type {boolean}
   */
  isSubmitting: false,

  /**
   * @type {ComputedProperty<'edit'|'view'>}
   */
  mode: reads('modalOptions.mode'),

  /**
   * @type {ComputedProperty<'lane'|'workflow'>}
   */
  dashboardOwnerType: reads('modalOptions.dashboardOwnerType'),

  /**
   * @type {ComputedProperty<AtmTimeSeriesDashboardSpec>}
   */
  dashboardSpec: reads('dashboardOwner.chartsDashboardEditorModelContainer.dashboardSpec'),

  /**
   * @type {ComputedProperty<Utils.AtmWorkflow.ChartsDashboardEditor.Model>}
   */
  dashboardModel: reads('dashboardOwner.chartsDashboardEditorModelContainer.dashboardModel'),

  /**
   * @type {ComputedProperty<EmberObject>}
   */
  dashboardOwner: reads('modalOptions.dashboardOwner'),

  /**
   * @type {ComputedProperty<ObjectProxy<boolean>>}
   */
  isLiveProxy: reads('modalOptions.isLiveProxy'),

  /**
   * @type {ComputedProperty<(store: Utils.WorkflowVisualiser.Store, browseOptions: AtmStoreContentBrowseOptions) => Promise<AtmStoreContentBrowseResult|null>>}
   */
  getStoreContentCallback: reads('modalOptions.getStoreContentCallback'),

  /**
   * @type {ComputedProperty<() => AtmTimeSeriesCollectionReferencesMap>}
   */
  getTimeSeriesCollectionRefsMapCallback: reads(
    'modalOptions.getTimeSeriesCollectionRefsMapCallback'
  ),

  /**
   * @override
   */
  init() {
    this._super(...arguments);
    this.set('activeTab', this.mode === 'view' ? 'visualisation' : 'definition');
  },

  actions: {
    async submit(submitCallback) {
      this.set('isSubmitting', true);
      try {
        return await submitCallback();
      } finally {
        trySet(this, 'isSubmitting', false);
      }
    },
  },
});
