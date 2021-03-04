import VisualiserSpace from 'onedata-gui-common/components/workflow-visualiser/visualiser-space';
import layout from 'onedata-gui-common/templates/components/workflow-visualiser/interlane-space';
import { reads } from '@ember/object/computed';

export default VisualiserSpace.extend({
  layout,
  classNames: ['workflow-visualiser-interlane-space'],

  /**
   * @type {ComputedProperty<Utils.WorkflowVisualiser.InterlaneSpace>}
   */
  interlaneSpace: reads('elementModel'),

  actions: {
    addLane() {
      this.get('interlaneSpace').addLane();
    },
  },
});
