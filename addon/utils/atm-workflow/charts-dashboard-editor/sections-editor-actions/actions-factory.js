/**
 * Creates actions used by sections editor.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import AddSubsectionAction from './add-subsection-action';

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
   * @param {AddSubsectionActionContext} context
   * @returns {Utils.AtmWorkflow.ChartsDashboardEditor.SectionsEditorActions.AddSubsectionAction}
   */
  createAddSubsectionAction(context) {
    return this.attachExecuteListener(AddSubsectionAction.create({
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
