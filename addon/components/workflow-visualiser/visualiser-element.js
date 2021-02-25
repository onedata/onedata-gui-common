import Component from '@ember/component';
import layout from 'onedata-gui-common/templates/components/workflow-visualiser/visualiser-element';
import { reads } from '@ember/object/computed';
import { tag } from 'ember-awesome-macros';

export default Component.extend({
  layout,
  classNames: ['workflow-visualiser-element'],
  classNameBindings: ['modeClass'],
  attributeBindings: ['visualiserElement.id:data-visualiser-element-id'],

  /**
   * @virtual
   * @type {Utils.WorkflowVisualiser.VisualiserElement}
   */
  visualiserElement: undefined,

  /**
   * @type {ComputedProperty<String>}
   */
  mode: reads('visualiserElement.mode'),

  /**
   * @type {ComputedProperty<String>}
   */
  modeClass: tag `mode-${'mode'}`,
});
