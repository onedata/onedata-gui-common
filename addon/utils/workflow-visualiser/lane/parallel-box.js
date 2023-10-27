/**
 * Parallel box - aggregates tasks and spaces between them.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import _ from 'lodash';
import VisualiserRecord from 'onedata-gui-common/utils/workflow-visualiser/visualiser-record';

export default VisualiserRecord.extend({
  /**
   * @override
   */
  __modelType: 'parallelBox',

  /**
   * @override
   */
  renderer: 'workflow-visualiser/lane/parallel-box',

  /**
   * @virtual
   * @type {Utils.WorkflowVisualiser.Lane}
   */
  parent: undefined,

  /**
   * @virtual optional
   * @type {Array<Utils.WorkflowVisualiser.VisualiserElement>}
   */
  elements: undefined,

  /**
   * @type {Array<Utils.WorkflowVisualiser.Lane.Task>}
   */
  tasks: computed('element.[]', function tasks() {
    return this.elements?.filter((element) =>
      element.__modelType === 'task'
    ) ?? [];
  }),

  /**
   * @type {ComputedProperty<Array<ChartsDashboardEditorDataSource>>}
   */
  chartsDashboardEditorDataSources: computed(
    'tasks.@each.chartsDashboardEditorDataSources',
    function chartsDashboardEditorDataSources() {
      return _.flatten(
        this.tasks.map((task) => task.chartsDashboardEditorDataSources ?? [])
      );
    }
  ),

  init() {
    this._super(...arguments);

    if (!this.get('elements')) {
      this.set('elements', []);
    }
  },
});
