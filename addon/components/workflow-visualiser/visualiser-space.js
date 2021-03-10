/**
 * Base component for visualiser elements spaces.
 *
 * @module components/workflow-visualiser/visualiser-space
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import VisualiserElement from 'onedata-gui-common/components/workflow-visualiser/visualiser-element';
import { computed, get } from '@ember/object';
import { reads } from '@ember/object/computed';
import { next } from '@ember/runloop';
import { inject as service } from '@ember/service';

export default VisualiserElement.extend({
  classNames: ['workflow-visualiser-space'],
  classNameBindings: ['isTargetForDrop:may-accept-drag'],
  attributeBindings: [
    'elementBefore.id:data-element-before-id',
    'elementAfter.id:data-element-after-id',
  ],

  dragCoordinator: service(),

  /**
   * @type {ComputedProperty<Utils.WorkflowVisualiser.Lane>}
   */
  elementBefore: reads('elementModel.elementBefore'),

  /**
   * @type {ComputedProperty<Utils.WorkflowVisualiser.Lane>}
   */
  elementAfter: reads('elementModel.elementAfter'),

  /**
   * @type {ComputedProperty<Utils.WorkflowVisualiser.Lane>}
   */
  siblingsType: reads('elementModel.siblingsType'),

  /**
   * @type {ComputedProperty<Boolean>}
   */
  isTargetForDrop: computed(
    'dragCoordinator.currentDragObject',
    'elementBefore',
    'elementAfter',
    'siblingsType',
    function isTargetForDrop() {
      const {
        elementBefore,
        elementAfter,
        siblingsType,
      } = this.getProperties(
        'elementBefore',
        'elementAfter',
        'siblingsType'
      );
      const currentDragObject = this.get('dragCoordinator.currentDragObject');
      const draggedElement = currentDragObject &&
        get(currentDragObject, get(currentDragObject, 'unwrappingKey'));

      return draggedElement &&
        get(draggedElement, 'type') === siblingsType &&
        draggedElement !== elementBefore &&
        draggedElement !== elementAfter;
    }
  ),

  actions: {
    validateDragEvent() {
      return this.get('isTargetForDrop');
    },
    acceptDraggedElement(draggedElement) {
      // Using `next` to allows dragged component to notify `dragEnd` before destroy
      // due to incoming update and rerender.
      next(() =>
        this.get('elementModel').dragDropElement(draggedElement)
      );
    },
  },
});
