/**
 * Creates actions used by sections editor. Internally monitors each action
 * execution and notifies about every such event through execute listeners (see
 * `addExecuteListener` and `removeExecuteListeners`).
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import AddElementAction from './add-element-action';
import MoveElementAction from './move-element-action';
import DuplicateElementAction from './duplicate-element-action';
import RemoveElementAction from './remove-element-action';

/**
 * @typedef {(action: Utils.Action) => void} ActionExecuteListener
 */

export default class ActionsFactory {
  /**
   * @param {unknown} ownerSource
   */
  constructor(ownerSource) {
    /**
     * @private
     * @type {unknown}
     */
    this.ownerSource = ownerSource;

    /**
     * @private
     * @type {Set<ActionExecuteListener>}
     */
    this.executeListeners = new Set();
  }

  /**
   * @public
   * @returns {void}
   */
  destroy() {
    this.executeListeners.clear();
    this.ownerSource = null;
  }

  /**
   * @public
   * @param {ActionExecuteListener} listener
   * @returns {void}
   */
  addExecuteListener(listener) {
    this.executeListeners.add(listener);
  }

  /**
   * @public
   * @param {ActionExecuteListener} listener
   * @returns {void}
   */
  removeExecuteListener(listener) {
    this.executeListeners.delete(listener);
  }

  /**
   * @public
   * @param {AddElementActionContext} context
   * @returns {Utils.AtmWorkflow.ChartsDashboardEditor.SectionsEditorActions.AddElementAction}
   */
  createAddElementAction(context) {
    return this.attachExecuteListener(AddElementAction.create({
      ownerSource: this.ownerSource,
      context,
    }));
  }

  /**
   * @public
   * @param {MoveElementActionContext} context
   * @returns {Utils.AtmWorkflow.ChartsDashboardEditor.SectionsEditorActions.MoveElementAction}
   */
  createMoveElementAction(context) {
    return this.attachExecuteListener(MoveElementAction.create({
      ownerSource: this.ownerSource,
      context,
    }));
  }

  /**
   * @public
   * @param {DuplicateElementActionContext} context
   * @returns {Utils.AtmWorkflow.ChartsDashboardEditor.SectionsEditorActions.DuplicateElementAction}
   */
  createDuplicateElementAction(context) {
    return this.attachExecuteListener(DuplicateElementAction.create({
      ownerSource: this.ownerSource,
      context,
    }));
  }

  /**
   * @public
   * @param {RemoveElementActionContext} context
   * @returns {Utils.AtmWorkflow.ChartsDashboardEditor.SectionsEditorActions.RemoveElementAction}
   */
  createRemoveElementAction(context) {
    return this.attachExecuteListener(RemoveElementAction.create({
      ownerSource: this.ownerSource,
      context,
    }));
  }

  /**
   * @private
   * @param {Utils.Action} action
   * @returns {Utils.Action}
   */
  attachExecuteListener(action) {
    action.addExecuteHook((result) => {
      if (result?.status === 'done') {
        this.executeListeners.forEach((listener) => listener(action));
      }
    });
    return action;
  }
}
