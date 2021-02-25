import LaneElement from 'onedata-gui-common/utils/workflow-visualiser/lane/lane-element';
import { resolve } from 'rsvp';

export default LaneElement.extend({
  /**
   * @override
   */
  renderer: 'workflow-visualiser/lane/parallel-block',

  /**
   * @override
   */
  type: 'parallelBlock',

  /**
   * @virtual
   * @type {String}
   */
  name: undefined,

  /**
   * @virtual optional
   * @type {Array<Utils.WorkflowVisualiser.Lane.LaneElement>}
   */
  elements: undefined,

  /**
   * @type {Function}
   * @param {Utils.WorkflowVisualiser.Lane.ParallelBlock} parallelBlock
   * @param {Object} modifiedProps
   * @returns {Promise}
   */
  onModify: undefined,

  /**
   * @type {Function}
   * @param {Utils.WorkflowVisualiser.Lane.ParallelBlock} parallelBlock
   * @returns {Promise}
   */
  onRemove: undefined,

  init() {
    this._super(...arguments);

    if (!this.get('elements')) {
      this.set('elements', []);
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
});
