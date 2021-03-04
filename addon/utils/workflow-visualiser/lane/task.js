import VisualiserElement from 'onedata-gui-common/utils/workflow-visualiser/visualiser-element';
import { resolve } from 'rsvp';

export default VisualiserElement.extend({
  /**
   * @override
   */
  renderer: 'workflow-visualiser/lane/task',

  /**
   * @override
   */
  type: 'task',

  /**
   * @virtual
   * @type {String}
   */
  name: undefined,

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

  /**
   * @type {Function}
   * @param {Utils.WorkflowVisualiser.Lane.Task} task
   * @param {Object} modifiedProps
   * @returns {Promise}
   */
  onModify: undefined,

  /**
   * @type {Function}
   * @param {Utils.WorkflowVisualiser.Lane.Task} task
   * @returns {Promise}
   */
  onRemove: undefined,

  modify(modifiedProps) {
    const onModify = this.get('onModify');
    return onModify ? onModify(this, modifiedProps) : resolve();
  },

  remove() {
    const onRemove = this.get('onRemove');
    return onRemove ? onRemove(this) : resolve();
  },
});
