// TODO: VFS-9257 fix eslint issues in this file
/* eslint-disable jsdoc/require-returns */

/**
 * Base class for visualiser elements spaces.
 *
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
   * @param {Utils.WorkflowVisualiser.VisualiserRecord|null} parent
   * @param {Utils.WorkflowVisualiser.VisualiserRecord|null} afterElement
   * @param {Object} newElementProps
   * @returns {Promise}
   */
  onAddElement: undefined,

  /**
   * @virtual
   * @type {Function}
   * @param {Utils.WorkflowVisualiser.VisualiserRecord|null} parent
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

  /**
   * @param {Object} newElementProps
   * @returns {Promise}
   */
  addElement(newElementProps) {
    const {
      onAddElement,
      parent,
      elementBefore,
    } = this.getProperties('onAddElement', 'parent', 'elementBefore');

    if (onAddElement) {
      return onAddElement(parent, elementBefore, newElementProps);
    } else {
      return resolve();
    }
  },

  /**
   * @param {Utils.WorkflowVisualiser.VisualiserRecord} newElementProps
   * @returns {Promise}
   */
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
