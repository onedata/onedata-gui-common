import VisualiserRecord from 'onedata-gui-common/utils/workflow-visualiser/visualiser-record';

export default VisualiserRecord.extend({
  /**
   * @override
   */
  renderer: 'workflow-visualiser/lane/task',

  /**
   * @override
   */
  type: 'task',

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
