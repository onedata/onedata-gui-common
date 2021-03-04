import VisualiserElement from 'onedata-gui-common/components/workflow-visualiser/visualiser-element';
import layout from 'onedata-gui-common/templates/components/workflow-visualiser/interlane-space';
import { reads } from '@ember/object/computed';

export default VisualiserElement.extend({
  layout,
  classNames: ['workflow-visualiser-interlane-space'],
  attributeBindings: [
    'firstLane.id:data-first-lane-id',
    'secondLane.id:data-second-lane-id',
  ],

  /**
   * @type {ComputedProperty<Utils.WorkflowVisualiser.InterlaneSpace>}
   */
  interlaneSpace: reads('elementModel'),

  /**
   * @type {ComputedProperty<Utils.WorkflowVisualiser.Lane>}
   */
  firstLane: reads('interlaneSpace.firstLane'),

  /**
   * @type {ComputedProperty<Utils.WorkflowVisualiser.Lane>}
   */
  secondLane: reads('interlaneSpace.secondLane'),

  actions: {
    addLane() {
      this.get('interlaneSpace').addLane();
    },
  },
});
