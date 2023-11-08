/**
 * Lane - aggregates parallel boxes and spaces between them.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import _ from 'lodash';
import { resolve } from 'rsvp';
import VisualiserRecord from 'onedata-gui-common/utils/workflow-visualiser/visualiser-record';
import ChartsDashboardEditorModelContainer from 'onedata-gui-common/utils/atm-workflow/charts-dashboard-editor-model-container';

export default VisualiserRecord.extend({
  /**
   * @override
   */
  __modelType: 'lane',

  /**
   * @override
   */
  renderer: 'workflow-visualiser/lane',

  /**
   * @override
   */
  visibleRunNumber: 1,

  /**
   * @virtual
   * @type {number}
   */
  maxRetries: undefined,

  /**
   * @virtual
   * @type {number}
   */
  instantFailureExceptionThreshold: undefined,

  /**
   * @virtual
   * @type {Object}
   */
  storeIteratorSpec: undefined,

  /**
   * @virtual
   * @type {AtmTimeSeriesDashboardSpec | null}
   */
  dashboardSpec: null,

  /**
   * @virtual
   * @type {Array<Utils.WorkflowVisualiser.VisualiserElement>}
   */
  elements: undefined,

  /**
   * @virtual
   * @type {RunsListVisibleRunsPosition}
   */
  visibleRunsPosition: undefined,

  /**
   * @virtual optional
   * @type {Function}
   * @param {Utils.WorkflowVisualiser.Lane} lane
   * @returns {Promise}
   */
  onClear: undefined,

  /**
   * @virtual optional
   * @type {Function}
   * @param {Utils.WorkflowVisualiser.Lane} lane
   * @param {AtmLaneRunNumber} runNumber
   * @returns {Any}
   */
  onChangeRun: undefined,

  /**
   * @virtual optional
   * @type {Function}
   * @param {Utils.WorkflowVisualiser.Lane} lane
   * @returns {Promise}
   */
  onShowLatestRun: undefined,

  /**
   * @type {Array<Utils.WorkflowVisualiser.Lane.ParallelBox>}
   */
  parallelBoxes: computed('element.[]', function parallelBoxes() {
    return this.elements?.filter((element) =>
      element.__modelType === 'parallelBox'
    ) ?? [];
  }),

  /**
   * @type {ComputedProperty<Array<ChartsDashboardEditorDataSource>>}
   */
  chartsDashboardEditorDataSources: computed(
    'parallelBoxes.@each.chartsDashboardEditorDataSources',
    function chartsDashboardEditorDataSources() {
      return _.flatten(
        this.parallelBoxes.map((parallelBox) =>
          parallelBox.chartsDashboardEditorDataSources ?? []
        )
      );
    }
  ),

  /**
   * @type {ComputedPropertyChartsDashboardEditorModelContainer>}
   */
  chartsDashboardEditorModelContainer: computed(
    function chartsDashboardEditorModelContainer() {
      return ChartsDashboardEditorModelContainer.extend({
        dashboardSpec: reads('relatedElement.dashboardSpec'),
      }).create({
        relatedElement: this,
        onPropagateChange: (newDashboardSpec) => {
          this.modify({
            dashboardSpec: newDashboardSpec,
          });
        },
      });
    }
  ),

  /**
   * @type {ComputedProperty<Utils.WorkflowVisualiser.Store>}
   */
  iteratedStore: reads('visibleRun.iteratedStore'),

  /**
   * @type {ComputedProperty<Utils.WorkflowVisualiser.Store>}
   */
  exceptionStore: reads('visibleRun.exceptionStore'),

  init() {
    this._super(...arguments);

    if (!this.get('elements')) {
      this.set('elements', []);
    }
  },

  clear() {
    const onClear = this.get('onClear');
    return onClear ? onClear(this) : resolve();
  },

  changeRun(runNumber) {
    const onChangeRun = this.get('onChangeRun');
    return onChangeRun && onChangeRun(this, runNumber);
  },

  showLatestRun() {
    const onShowLatestRun = this.get('onShowLatestRun');
    return onShowLatestRun ? onShowLatestRun(this) : resolve();
  },

  /**
   * @returns {Array<string>}
   */
  getUsedStoreSchemaIds() {
    const iteratorStoreSchemaId = this.storeIteratorSpec?.storeSchemaId;
    return iteratorStoreSchemaId ? [iteratorStoreSchemaId] : [];
  },
});
