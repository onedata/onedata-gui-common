/**
 * A modal that allows to view and modify charts dashboard.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022-2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import layout from 'onedata-gui-common/templates/components/modals/workflow-visualiser/charts-modal';
import { reads } from '@ember/object/computed';
/**
 * @typedef {Object} WorkflowVisualiserChartsModalOptions
 * @property {DashboardModelOwner} dashboardOwner
 * @property {ObjectProxy<boolean>} isLiveProxy Needed only in `view` mode
 * @property {(store: Utils.WorkflowVisualiser.Store, browseOptions: AtmStoreContentBrowseOptions) => Promise<AtmStoreContentBrowseResult|null>} [getStoreContentCallback]
 *   Useful only in `view` mode. If not provided, only chart definition will be visible.
 * @property {() => AtmTimeSeriesCollectionReferencesMap} [getTimeSeriesCollectionRefsMapCallback]
 *   Needed only in `view` mode. If not provided, only chart definition will be visible.
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
   * @type {ComputedProperty<DashboardModelOwner>}
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
   * @type {ComputedProperty<'store'|'task'|'lane'|'workflow'>}
   */
  dashboardOwnerType: reads('dashboardOwner.__modelType'),
});
