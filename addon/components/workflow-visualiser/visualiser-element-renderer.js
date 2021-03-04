import Component from '@ember/component';
import layout from 'onedata-gui-common/templates/components/workflow-visualiser/visualiser-element-renderer';
import { reads } from '@ember/object/computed';

export default Component.extend({
  layout,
  tagName: '',

  /**
   * @type {Utils.WorkflowVisualiser.VisualiserElement|Utils.WorkflowVisualiser.Lane.LaneElement}
   */
  elementModel: undefined,

  /**
   * @type {ComputedProperty<String>}
   */
  elementRenderer: reads('elementModel.renderer'),
});
