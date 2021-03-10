/**
 * Base class for visualiser elements spaces.
 *
 * @module utils/workflow-visualiser/visualiser-space
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import VisualiserElement from 'onedata-gui-common/utils/workflow-visualiser/visualiser-element';
import { guidFor } from '@ember/object/internals';
import { resolve } from 'rsvp';

export default VisualiserElement.extend({
  /**
   * @virtual
   * @type {Utils.WorkflowVisualiser.VisualiserRecord|null}
   */
  elementBefore: undefined,

  /**
   * @virtual
   * @type {Utils.WorkflowVisualiser.VisualiserRecord|null}
   */
  elementAfter: undefined,

  /**
   * Type of `elementBefore` and `elementAfter`
   * @virtual
   * @type {String}
   */
  siblingsType: undefined,

  /**
   * @virtual
   * @type {Function}
   * @param {Utils.WorkflowVisualiser.VisualiserRecord} parent
   * @param {Utils.WorkflowVisualiser.VisualiserRecord|null} afterElement
   * @param {Utils.WorkflowVisualiser.VisualiserRecord} droppedElement
   * @returns {Promise}
   */
  onDragDropElement: undefined,

  init() {
    this._super(...arguments);

    if (this.get('id') === undefined) {
      this.set('id', guidFor(this));
    }
  },

  dragDropElement(droppedElement) {
    const {
      onDragDropElement,
      parent,
      elementBefore,
    } = this.getProperties('onDragDropElement', 'parent', 'elementBefore');

    if (onDragDropElement) {
      return onDragDropElement(parent, elementBefore, droppedElement);
    } else {
      return resolve();
    }
  },
});
