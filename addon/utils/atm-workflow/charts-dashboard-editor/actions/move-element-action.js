/**
 * Moves dashboard element to another place.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Action, { ActionUndoPossibility } from 'onedata-gui-common/utils/action';
import { set, computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { getCollectionFieldName } from './utils';

/**
 * @typedef {Object} MoveElementActionContext
 * @property {Utils.AtmWorkflow.ChartsDashboardEditor.DashboardElement} movedElement
 * @property {string} [currentRelationFieldName]
 * @property {Utils.AtmWorkflow.ChartsDashboardEditor.DashboardElement} newParent
 * @property {string} [newRelationFieldName]
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
   * @type {ComputedProperty<string>}
   */
  newRelationFieldName: computed(
    'context.newRelationFieldName',
    'movedElement.elementType',
    function newRelationFieldName() {
      return this.context.newRelationFieldName ??
        getCollectionFieldName(this.movedElement.elementType);
    }
  ),

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
   * @type {ComputedProperty<string>}
   */
  oldRelationFieldName: computed(
    'context.currentRelationFieldName',
    'movedElement.elementType',
    function newRelationFieldName() {
      return this.context.currentRelationFieldName ??
        getCollectionFieldName(this.movedElement.elementType);
    }
  ),

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
    const currentParentCollection = currentParent[this.oldRelationFieldName];

    let currentPosition = null;
    if (Array.isArray(currentParentCollection)) {
      const movedElementIdx =
        currentParentCollection.indexOf(this.movedElement);
      if (movedElementIdx < currentParentCollection.length - 1) {
        currentPosition = {
          placement: 'before',
          referenceElement: currentParentCollection[movedElementIdx + 1],
        };
      }
    }

    this.setProperties({
      oldParent: currentParent,
      oldPosition: currentPosition,
    });

    this.moveElement(
      this.oldRelationFieldName,
      this.newParent,
      this.newRelationFieldName,
      this.newPosition
    );
    this.changeViewState({ elementToSelect: this.movedElement });
  },

  /**
   * @override
   */
  onExecuteUndo() {
    this.moveElement(
      this.newRelationFieldName,
      this.oldParent,
      this.oldRelationFieldName,
      this.oldPosition
    );
    this.changeViewState({ elementToSelect: this.movedElement });
  },

  /**
   * @param {MoveElementActionContext['newParent']} newParent
   * @param {MoveElementActionContext['newPosition']} newPosition
   * @returns {void}
   */
  moveElement(currentRelationFieldName, newParent, newRelationFieldName, newPosition) {
    const currentParent = this.movedElement.parent;
    const currentParentCollection = currentParent[currentRelationFieldName];
    if (Array.isArray(currentParentCollection)) {
      set(
        currentParent,
        currentRelationFieldName,
        currentParentCollection.filter((element) => element !== this.movedElement)
      );
    } else {
      set(currentParent, currentRelationFieldName, null);
    }

    const newParentCollection = newParent[newRelationFieldName];
    if (Array.isArray(newParentCollection)) {
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
      set(newParent, newRelationFieldName, [
        ...newParentCollection.slice(0, newElementIdx),
        this.movedElement,
        ...newParentCollection.slice(newElementIdx),
      ]);
    } else {
      set(newParent, newRelationFieldName, this.movedElement);
    }

    set(this.movedElement, 'parent', newParent);
  },
});
