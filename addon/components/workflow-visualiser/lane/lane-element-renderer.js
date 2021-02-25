import Component from '@ember/component';
import layout from 'onedata-gui-common/templates/components/workflow-visualiser/lane/lane-element-renderer';
import { reads } from '@ember/object/computed';

export default Component.extend({
  layout,
  tagName: '',

  /**
   * @type {Utils.WorkflowVisualiser.Lane.LaneElement}
   */
  laneElement: undefined,

  /**
   * @type {ComputedProperty<String>}
   */
  elementRenderer: reads('laneElement.renderer'),
});
