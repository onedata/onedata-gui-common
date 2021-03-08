/**
 * Base component for visualiser elements spaces.
 *
 * @module components/workflow-visualiser/visualiser-space
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import VisualiserElement from 'onedata-gui-common/components/workflow-visualiser/visualiser-element';
import { reads } from '@ember/object/computed';

export default VisualiserElement.extend({
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
