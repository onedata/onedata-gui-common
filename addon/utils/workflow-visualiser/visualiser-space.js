import VisualiserElement from 'onedata-gui-common/utils/workflow-visualiser/visualiser-element';
import { guidFor } from '@ember/object/internals';

export default VisualiserElement.extend({
  /**
   * @virtual
   * @type {Utils.WorkflowVisualiser.VisualiserElement}
   */
  elementBefore: undefined,

  /**
   * @virtual
   * @type {Utils.WorkflowVisualiser.VisualiserElement}
   */
  elementAfter: undefined,

  init() {
    this._super(...arguments);

    if (this.get('id') === undefined) {
      this.set('id', guidFor(this));
    }
  },
});
