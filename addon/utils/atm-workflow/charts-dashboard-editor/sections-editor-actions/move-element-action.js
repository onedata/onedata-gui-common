/**
 * Moves section or chart to another place.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Action, { ActionUndoPossibility } from 'onedata-gui-common/utils/action';
import { set } from '@ember/object';
import { reads } from '@ember/object/computed';
import { computed } from '@ember/object';
import { ElementType } from '../common';

/**
 * @typedef {Object} MoveElementActionContext
 * @property {Utils.AtmWorkflow.ChartsDashboardEditor.Chart | Utils.AtmWorkflow.ChartsDashboardEditor.Section} movedElement
 * @property {Utils.AtmWorkflow.ChartsDashboardEditor.Section} newParent
 * @property {MoveElementActionNewPosition | null} newPosition
 *   `null` will place `movedElement` at the end
 * @property {(elementToSelect: Utils.AtmWorkflow.ChartsDashboardEditor.Chart | Utils.AtmWorkflow.ChartsDashboardEditor.Section | null) => void} onSelectElement
 */

/**
 * @typedef {Object} MoveElementActionNewPosition
 * @property {'before' | 'after'} placement
 * @property {Utils.AtmWorkflow.ChartsDashboardEditor.Chart | Utils.AtmWorkflow.ChartsDashboardEditor.Section} referenceElement
 */

export default Action.extend({
  /**
   * @override
   */
  undoPossibility: ActionUndoPossibility.Possible,

  /**
   * @virtual
   * @type {MoveElementActionContext}
   */
  context: undefined,

  /**
   * @type {ComputedProperty<MoveElementActionContext['movedElement']>}
   */
  movedElement: reads('context.movedElement'),

  /**
   * @type {ComputedProperty<MoveElementActionContext['newParent']>}
   */
  newParent: reads('context.newParent'),

  /**
   * @type {ComputedProperty<MoveElementActionContext['newPosition']>}
   */
  newPosition: reads('context.newPosition'),

  /**
   * @type {ComputedProperty<MoveElementActionContext['onSelectElement']>}
   */
  onSelectElement: reads('context.onSelectElement'),

  /**
   * Becomes defined during action execution
   * @type {MoveElementActionContext['newParent'] | null}
   */
  oldParent: null,

  /**
   * Becomes defined during action execution
   * @type {MoveElementActionContext['newPosition']}
   */
  oldPosition: null,

  /**
   * @type {ComputedProperty<'sections' | 'charts'>}
   */
  collectionName: computed(
    'movedElement.elementType',
    function collectionName() {
      return this.movedElement.elementType === ElementType.Section ?
        'sections' : 'charts';
    }
  ),

  /**
   * @override
   */
  willDestroy() {
    try {
      this.setProperties({
        context: null,
        oldParent: null,
        oldPosition: null,
      });
    } finally {
      this._super(...arguments);
    }
  },

  /**
   * @override
   */
  onExecute() {
    const oldParent = this.movedElement.parentSection;
    const oldParentCollection = oldParent[this.collectionName];
    const movedElementOldIdx =
      oldParentCollection.indexOf(this.movedElement);
    let oldPosition = null;
    if (movedElementOldIdx < oldParentCollection.length - 1) {
      oldPosition = {
        placement: 'before',
        referenceElement: oldParentCollection[movedElementOldIdx + 1],
      };
    }
    this.setProperties({
      oldParent,
      oldPosition,
    });

    this.moveElement(this.newParent, this.newPosition);
    this.onSelectElement(this.movedElement);
  },

  /**
   * @override
   */
  onExecuteUndo() {
    this.moveElement(this.oldParent, this.oldPosition);
    this.onSelectElement(this.movedElement);
  },

  /**
   * @param {MoveElementActionContext['newParent']} newParent
   * @param {MoveElementActionContext['newPosition']} newPosition
   * @returns {void}
   */
  moveElement(newParent, newPosition) {
    set(
      this.movedElement.parentSection,
      this.collectionName,
      this.movedElement.parentSection[this.collectionName].filter((element) =>
        element !== this.movedElement
      )
    );

    const newParentCollection = newParent[this.collectionName];
    const referenceElementIdx = newPosition ?
      newParentCollection.indexOf(newPosition.referenceElement) :
      -1;
    let newElementIdx;
    if (referenceElementIdx > -1) {
      if (newPosition?.placement === 'before') {
        newElementIdx = referenceElementIdx;
      } else {
        newElementIdx = referenceElementIdx + 1;
      }
    } else {
      newElementIdx = newParentCollection.length;
    }
    set(newParent, this.collectionName, [
      ...newParentCollection.slice(0, newElementIdx),
      this.movedElement,
      ...newParentCollection.slice(newElementIdx),
    ]);
    set(this.movedElement, 'parentSection', newParent);
  },
});
