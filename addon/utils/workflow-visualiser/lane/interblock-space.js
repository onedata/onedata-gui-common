/**
 * Space between parallel blocks or tasks. Allows creating new elements.
 *
 * @module utils/workflow-visualiser/lane/interblock-space
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import VisualiserSpace from 'onedata-gui-common/utils/workflow-visualiser/visualiser-space';
import { resolve } from 'rsvp';

export default VisualiserSpace.extend({
  /**
   * @override
   */
  renderer: 'workflow-visualiser/lane/interblock-space',

  /**
   * @override
   */
  type: 'interblockSpace',

  /**
   * @virtual
   * @type {Function}
   * @param {Utils.WorkflowVisualiser.VisualiserRecord} parent
   * @param {Utils.WorkflowVisualiser.VisualiserRecord|null} afterElement
   * @returns {Promise}
   */
  onAddLaneElement: undefined,

  /**
   * @virtual
   * @type {Function}
   * @param {Utils.WorkflowVisualiser.VisualiserRecord} parent
   * @param {Utils.WorkflowVisualiser.VisualiserRecord|null} afterElement
   * @returns {Promise}
   */
  onDropLaneElement: undefined,

  addLaneElement() {
    const {
      onAddLaneElement,
      parent,
      elementBefore,
    } = this.getProperties('onAddLaneElement', 'parent', 'elementBefore');

    if (onAddLaneElement) {
      return onAddLaneElement(parent, elementBefore);
    } else {
      return resolve();
    }
  },

  dropLaneElement(droppedElement) {
    const {
      onDropLaneElement,
      parent,
      elementBefore,
    } = this.getProperties('onDropLaneElement', 'parent', 'elementBefore');

    if (onDropLaneElement) {
      return onDropLaneElement(parent, elementBefore, droppedElement);
    } else {
      return resolve();
    }
  },
});
