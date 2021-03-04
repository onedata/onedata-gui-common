import VisualiserElement from 'onedata-gui-common/components/workflow-visualiser/visualiser-element';
import layout from 'onedata-gui-common/templates/components/workflow-visualiser/interlane-space';
import { reads } from '@ember/object/computed';

export default VisualiserElement.extend({
  layout,
  classNames: ['workflow-visualiser-interlane-space'],
  attributeBindings: [
    'elementBefore.id:data-element-before-id',
    'elementAfter.id:data-element-after-id',
  ],

  /**
   * @type {ComputedProperty<Utils.WorkflowVisualiser.InterlaneSpace>}
   */
  interlaneSpace: reads('elementModel'),

  /**
   * @type {ComputedProperty<Utils.WorkflowVisualiser.Lane>}
   */
  elementBefore: reads('interlaneSpace.elementBefore'),

  /**
   * @type {ComputedProperty<Utils.WorkflowVisualiser.Lane>}
   */
  elementAfter: reads('interlaneSpace.elementAfter'),

  actions: {
    addLane() {
      this.get('interlaneSpace').addLane();
    },
  },
});
