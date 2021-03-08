/**
 * Base component for all visualisers components.
 *
 * @module components/workflow-visualiser/visualiser-element
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { reads } from '@ember/object/computed';
import { tag } from 'ember-awesome-macros';

export default Component.extend({
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
