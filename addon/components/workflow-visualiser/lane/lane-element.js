import Component from '@ember/component';
import layout from 'onedata-gui-common/templates/components/workflow-visualiser/lane/lane-element';
import { reads } from '@ember/object/computed';
import { tag } from 'ember-awesome-macros';

export default Component.extend({
  layout,
  classNames: ['workflow-visualiser-lane-element'],
  classNameBindings: ['modeClass'],
  attributeBindings: ['laneElement.id:data-visualiser-element-id'],

  /**
   * @virtual
   * @type {Utils.WorkflowVisualiser.Lane.LaneElement}
   */
  laneElement: undefined,

  /**
   * @type {ComputedProperty<String>}
   */
  mode: reads('laneElement.mode'),

  /**
   * @type {ComputedProperty<String>}
   */
  modeClass: tag `mode-${'mode'}`,
});
