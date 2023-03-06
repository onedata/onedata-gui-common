/**
 * Parallel box - aggregates tasks and spaces between them.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

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
   * @virtual optional
   * @type {Array<Utils.WorkflowVisualiser.VisualiserElement>}
   */
  elements: undefined,

  init() {
    this._super(...arguments);

    if (!this.get('elements')) {
      this.set('elements', []);
    }
  },
});
