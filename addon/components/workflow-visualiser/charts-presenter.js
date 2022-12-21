/**
 * Generates charts visualisation for specific dashboard spec.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from 'onedata-gui-common/templates/components/workflow-visualiser/charts-presenter';

export default Component.extend({
  layout,
  classNames: ['workflow-visualiser-charts-presenter'],

  /**
   * @virtual
   * @type {AtmTimeSeriesDashboardSpec}
   */
  dashboardSpec: undefined,

  /**
   * @virtual
   * @type {() => AtmTimeSeriesCollectionReferencesMap}
   */
  onGetTimeSeriesCollectionRefsMap: undefined,

  /**
   * @virtual
   * @type {(store: Utils.WorkflowVisualiser.Store, browseOptions: AtmStoreContentBrowseOptions) => Promise<AtmStoreContentBrowseResult|null>}
   */
  getStoreContent: undefined,

  /**
   * @virtual optional
   * @type {AtmTimeSeriesCollectionReference}
   */
  defaultTimeSeriesCollectionRef: undefined,

  /**
   * @type {AtmTimeSeriesCollectionReferencesMap|null}
   */
  timeSeriesCollectionRefsMap: null,

  /**
   * @returns {AtmTimeSeriesCollectionReferencesMap}
   */
  getTimeSeriesCollectionRefsMap() {
    // FIXME: refresh map after few seconds
    if (this.timeSeriesCollectionRefsMap) {
      return this.timeSeriesCollectionRefsMap;
    } else {
      return this.set(
        'timeSeriesCollectionRefsMap',
        this.onGetTimeSeriesCollectionRefsMap?.() ?? new Map()
      );
    }
  },
});
