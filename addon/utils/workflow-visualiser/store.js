/**
 * Represents single workflow store.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject, { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { resolve } from 'rsvp';
import { getStoreReadDataSpec } from 'onedata-gui-common/utils/workflow-visualiser/data-spec-converters';
import ChartsDashboardEditorModelContainer from 'onedata-gui-common/utils/atm-workflow/charts-dashboard-editor-model-container';

export default EmberObject.extend({
  /**
   * @type {String}
   */
  __modelType: 'store',

  /**
   * @virtual
   * @type {String}
   */
  id: undefined,

  /**
   * @virtual optional
   * @type {String}
   */
  instanceId: undefined,

  /**
   * @virtual
   * @type {String}
   */
  name: undefined,

  /**
   * @virtual
   * @type {String}
   */
  description: undefined,

  /**
   * @virtual
   * @type {String}
   */
  type: undefined,

  /**
   * @virtual optional
   * @type {Object}
   */
  config: undefined,

  /**
   * @virtual optional
   * @type {any}
   */
  defaultInitialContent: undefined,

  /**
   * @virtual
   * @type {Boolean}
   */
  requiresInitialContent: undefined,

  /**
   * If this store is an internal store of some element (like audit log store
   * of a task), then that element is a `containerElement` of this store.
   * @type {Utils.WorkflowVisualiser.VisualiserRecord}
   */
  containerElement: undefined,

  /**
   * If true, then the content of this store can change, hence any content preview
   * should be updated regularly.
   * @virtual optional
   * @type {Boolean}
   */
  contentMayChange: true,

  /**
   * @virtual
   * @type {Array<Utils.WorkflowVisualiser.VisualiserRecord>}
   */
  referencingRecords: undefined,

  /**
   * @virtual optional
   * @type {Function}
   * @param {Utils.WorkflowVisualiser.Store} store
   * @param {Object} modifiedProps
   * @returns {Promise}
   */
  onModify: undefined,

  /**
   * @virtual optional
   * @type {Function}
   * @param {Utils.WorkflowVisualiser.Store} store
   * @returns {Promise}
   */
  onRemove: undefined,

  /**
   * @type {ComputedProperty<AtmDataSpec>}
   */
  readDataSpec: computed('type', 'config', function readDataSpec() {
    return getStoreReadDataSpec(this.getProperties('type', 'config'));
  }),

  /**
   * @type {ComputedProperty<Array<ChartsDashboardEditorDataSource>>}
   */
  chartsDashboardEditorDataSources: computed(
    'id',
    'name',
    'config.timeSeriesCollectionSchema',
    'containerElement.chartsDashboardEditorDataSources',
    function chartsDashboardEditorDataSources() {
      // We include container element's data sources as internal stores are considered
      // a part of its container, hence they have access to container's time series data.
      const dataSources = this.containerElement?.chartsDashboardEditorDataSources ?? [];

      if (
        this.id &&
        this.config?.timeSeriesCollectionSchema
      ) {
        dataSources.push({
          originName: this.name ?? '',
          collectionRef: `store-${this.id}`,
          timeSeriesCollectionSchema: this.config.timeSeriesCollectionSchema,
        });
      }

      return dataSources;
    }
  ),

  /**
   * @type {ComputedPropertyChartsDashboardEditorModelContainer>}
   */
  chartsDashboardEditorModelContainer: computed(
    function chartsDashboardEditorModelContainer() {
      return ChartsDashboardEditorModelContainer.extend({
        dashboardSpec: reads('relatedElement.config.dashboardSpec'),
      }).create({
        relatedElement: this,
        onPropagateChange: (newDashboardSpec) => this.modify({
          config: {
            ...this.config,
            dashboardSpec: newDashboardSpec,
          },
        }),
      });
    }
  ),

  init() {
    this._super(...arguments);
    if (!this.referencingRecords) {
      this.set('referencingRecords', []);
    }
  },

  modify(modifiedProps) {
    const onModify = this.get('onModify');
    return onModify ? onModify(this, modifiedProps) : resolve();
  },

  remove() {
    const onRemove = this.get('onRemove');
    return onRemove ? onRemove(this) : resolve();
  },

  /**
   * @param {Utils.WorkflowVisualiser.VisualiserRecord} record
   * @returns {void}
   */
  registerReferencingRecord(record) {
    if (!this.referencingRecords.includes(record)) {
      this.set('referencingRecords', [...this.referencingRecords, record]);
    }
  },

  /**
   * @returns {void}
   */
  clearReferencingRecords() {
    this.set('referencingRecords', []);
  },
});
