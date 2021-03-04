import Component from '@ember/component';
import layout from 'onedata-gui-common/templates/components/workflow-visualiser/visualiser-element';
import { reads } from '@ember/object/computed';
import { tag } from 'ember-awesome-macros';

export default Component.extend({
  layout,
  classNames: ['workflow-visualiser-element'],
  classNameBindings: ['modeClass'],
  attributeBindings: ['elementModel.id:data-visualiser-element-id'],

  /**
   * @virtual
   * @type {Utils.WorkflowVisualiser.VisualiserElement}
   */
  elementModel: undefined,

  /**
   * @type {ComputedProperty<String>}
   */
  mode: reads('elementModel.mode'),

  /**
   * @type {ComputedProperty<Utils.WorkflowVisualiser.VisualiserElement|null>}
   */
  parent: reads('elementModel.parent'),

  /**
   * @type {ComputedProperty<String>}
   */
  modeClass: tag `mode-${'mode'}`,
});
