/**
 * Moves dashboard element to another place.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Action, { ActionUndoPossibility } from 'onedata-gui-common/utils/action';
import { set } from '@ember/object';
import { reads } from '@ember/object/computed';
import { getCollectionFieldName } from './utils';

/**
 * @typedef {Object} MoveElementActionContext
 * @property {Utils.AtmWorkflow.ChartsDashboardEditor.DashboardElement} movedElement
 * @property {Utils.AtmWorkflow.ChartsDashboardEditor.DashboardElement} newParent
 * @property {MoveElementActionNewPosition | null} newPosition
 *   `null` will place `movedElement` at the end
 * @property {(viewStateChange: Utils.AtmWorkflow.ChartsDashboardEditor.ViewStateChange) => void} changeViewState
 */

/**
 * @typedef {Object} MoveElementActionNewPosition
 * @property {'before' | 'after'} placement
 * @property {Utils.AtmWorkflow.ChartsDashboardEditor.DashboardElement} referenceElement
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
   * @type {ComputedProperty<MoveElementActionContext['changeViewState']>}
   */
  changeViewState: reads('context.changeViewState'),

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
   * @override
   */
  willDestroy() {
    try {
      this.setProperties({
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
    const currentParent = this.movedElement.parent;
    const currentParentCollection =
      currentParent[getCollectionFieldName(this.movedElement.elementType)];
    const movedElementIdx =
      currentParentCollection.indexOf(this.movedElement);
    let currentPosition = null;
    if (movedElementIdx < currentParentCollection.length - 1) {
      currentPosition = {
        placement: 'before',
        referenceElement: currentParentCollection[movedElementIdx + 1],
      };
    }

    this.setProperties({
      oldParent: currentParent,
      oldPosition: currentPosition,
    });

    this.moveElement(this.newParent, this.newPosition);
    this.changeViewState({ elementToSelect: this.movedElement });
  },

  /**
   * @override
   */
  onExecuteUndo() {
    this.moveElement(this.oldParent, this.oldPosition);
    this.changeViewState({ elementToSelect: this.movedElement });
  },

  /**
   * @param {MoveElementActionContext['newParent']} newParent
   * @param {MoveElementActionContext['newPosition']} newPosition
   * @returns {void}
   */
  moveElement(newParent, newPosition) {
    const currentParent = this.movedElement.parent;
    const parentCollectionName = getCollectionFieldName(this.movedElement.elementType);
    const currentParentCollection = currentParent[parentCollectionName];
    set(
      currentParent,
      parentCollectionName,
      currentParentCollection.filter((element) => element !== this.movedElement)
    );

    const newParentCollection = newParent[parentCollectionName];

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
    set(newParent, parentCollectionName, [
      ...newParentCollection.slice(0, newElementIdx),
      this.movedElement,
      ...newParentCollection.slice(newElementIdx),
    ]);

    set(this.movedElement, 'parent', newParent);
  },
});
