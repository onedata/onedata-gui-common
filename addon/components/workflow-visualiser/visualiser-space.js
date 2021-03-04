import VisualiserElement from 'onedata-gui-common/components/workflow-visualiser/visualiser-element';
import layout from 'onedata-gui-common/templates/components/workflow-visualiser/interlane-space';
import { reads } from '@ember/object/computed';

export default VisualiserElement.extend({
  layout,
  classNames: ['workflow-visualiser-space'],
  attributeBindings: [
    'elementBefore.id:data-element-before-id',
    'elementAfter.id:data-element-after-id',
  ],

  /**
   * @type {ComputedProperty<Utils.WorkflowVisualiser.Lane>}
   */
  elementBefore: reads('elementModel.elementBefore'),

  /**
   * @type {ComputedProperty<Utils.WorkflowVisualiser.Lane>}
   */
  elementAfter: reads('elementModel.elementAfter'),
});
