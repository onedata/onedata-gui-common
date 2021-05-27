/**
 * Task - single job with progress.
 *
 * @module utils/workflow-visualiser/lane/task
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import VisualiserRecord from 'onedata-gui-common/utils/workflow-visualiser/visualiser-record';

export default VisualiserRecord.extend({
  /**
   * @override
   */
  __type: 'task',

  /**
   * @override
   */
  renderer: 'workflow-visualiser/lane/task',

  /**
   * One of: 'default', 'success', 'warning', 'error'
   * @virtual
   * @type {String}
   */
  status: 'default',

  /**
   * @virtual
   * @type {Number|null}
   */
  progressPercent: null,
});
