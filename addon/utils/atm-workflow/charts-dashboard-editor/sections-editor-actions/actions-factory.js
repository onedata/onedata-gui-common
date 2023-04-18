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
import SelectElementAction from './select-element-action';

/**
 * @typedef {(action: Utils.Action) => void} ActionExecuteListener
 */

/**
 * @typedef {Object} ActionsFactoryInitOptions
 * @property {unknown} ownerSource
 * @property {(elementToSelect: Utils.AtmWorkflow.ChartsDashboardEditor.Chart | Utils.AtmWorkflow.ChartsDashboardEditor.Section | null) => void} onSelectElement
 * @property {(elementToDeselect: Utils.AtmWorkflow.ChartsDashboardEditor.Chart | Utils.AtmWorkflow.ChartsDashboardEditor.Section) => void} onDeselectElement
 */

export default class ActionsFactory {
  /**
   * @param {ActionsFactoryInitOptions} initOptions
   */
  constructor({ ownerSource, onSelectElement, onDeselectElement } = {}) {
    /**
     * @private
     * @type {unknown}
     */
    this.ownerSource = ownerSource;

    /**
     * @private
     * @type {(elementToSelect: Utils.AtmWorkflow.ChartsDashboardEditor.Chart | Utils.AtmWorkflow.ChartsDashboardEditor.Section | null) => void}
     */
    this.onSelectElement = onSelectElement;

    /**
     * @private
     * @type {(elementToDeselect: Utils.AtmWorkflow.ChartsDashboardEditor.Chart | Utils.AtmWorkflow.ChartsDashboardEditor.Section) => void}
     */
    this.onDeselectElement = onDeselectElement;

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
    this.ownerSource = null;
    this.onSelectElement = () => {};
    this.executeListeners.clear();
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
   * @param {Omit<AddElementActionContext, 'onSelectElement' | 'onDeselectElement'>} context
   * @returns {Utils.AtmWorkflow.ChartsDashboardEditor.SectionsEditorActions.AddElementAction}
   */
  createAddElementAction(context) {
    return this.attachExecuteListener(AddElementAction.create({
      ownerSource: this.ownerSource,
      context: {
        onSelectElement: this.onSelectElement,
        onDeselectElement: this.onDeselectElement,
        ...context,
      },
    }));
  }

  /**
   * @public
   * @param {Omit<MoveElementActionContext, 'onSelectElement'} context
   * @returns {Utils.AtmWorkflow.ChartsDashboardEditor.SectionsEditorActions.MoveElementAction}
   */
  createMoveElementAction(context) {
    return this.attachExecuteListener(MoveElementAction.create({
      ownerSource: this.ownerSource,
      context: {
        onSelectElement: this.onSelectElement,
        ...context,
      },
    }));
  }

  /**
   * @public
   * @param {Omit<DuplicateElementActionContext, 'onSelectElement' | 'onDeselectElement'>} context
   * @returns {Utils.AtmWorkflow.ChartsDashboardEditor.SectionsEditorActions.DuplicateElementAction}
   */
  createDuplicateElementAction(context) {
    return this.attachExecuteListener(DuplicateElementAction.create({
      ownerSource: this.ownerSource,
      context: {
        onSelectElement: this.onSelectElement,
        onDeselectElement: this.onDeselectElement,
        ...context,
      },
    }));
  }

  /**
   * @public
   * @param {Omit<RemoveElementActionContext, 'onDeselectElement'>} context
   * @returns {Utils.AtmWorkflow.ChartsDashboardEditor.SectionsEditorActions.RemoveElementAction}
   */
  createRemoveElementAction(context) {
    return this.attachExecuteListener(RemoveElementAction.create({
      ownerSource: this.ownerSource,
      context: {
        onDeselectElement: this.onDeselectElement,
        ...context,
      },
    }));
  }

  /**
   * @public
   * @param {Omit<SelectElementActionContext, 'onSelectElement'>} context
   * @returns {Utils.AtmWorkflow.ChartsDashboardEditor.SectionsEditorActions.SelectElementAction}
   */
  createSelectElementAction(context) {
    return this.attachExecuteListener(SelectElementAction.create({
      ownerSource: this.ownerSource,
      context: {
        onSelectElement: this.onSelectElement,
        ...context,
      },
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
