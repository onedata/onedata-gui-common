import VisualiserRecord from 'onedata-gui-common/utils/workflow-visualiser/visualiser-record';

export default VisualiserRecord.extend({
  /**
   * @override
   */
  renderer: 'workflow-visualiser/lane/parallel-block',

  /**
   * @override
   */
  type: 'parallelBlock',

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
