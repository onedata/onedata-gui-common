/**
 * Creates actions used by sections editor. Internally monitors each action
 * execution and notifies about every such event through execute listeners (see
 * `addExecuteListener` and `removeExecuteListeners`).
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { set } from '@ember/object';
import AddElementAction from './add-element-action';
import MoveElementAction from './move-element-action';
import DuplicateElementAction from './duplicate-element-action';
import RemoveElementAction from './remove-element-action';
import SelectElementAction from './select-element-action';
import ChangeElementPropertyAction from './change-element-property-action';
import EditChartContentAction from './edit-chart-content-action';

/**
 * @typedef {(action: Utils.Action, result: Utils.ActionResult) => void} ActionExecuteListener
 */

/**
 * @typedef {Object} ActionsFactoryInitOptions
 * @property {unknown} ownerSource
 * @property {(elementToSelect: Utils.AtmWorkflow.ChartsDashboardEditor.Chart | Utils.AtmWorkflow.ChartsDashboardEditor.Section | null) => void} onSelectElement
 * @property {(elementToDeselect: Utils.AtmWorkflow.ChartsDashboardEditor.Chart | Utils.AtmWorkflow.ChartsDashboardEditor.Section) => void} onDeselectElement
 * @property {(chart: Utils.AtmWorkflow.ChartsDashboardEditor.Chart) => void} onOpenChartEditor
 */

export default class ActionsFactory {
  /**
   * @param {ActionsFactoryInitOptions} initOptions
   */
  constructor({
    ownerSource,
    onSelectElement,
    onDeselectElement,
    onOpenChartEditor,
  } = {}) {
    /**
     * @private
     * @type {ActionsFactoryInitOptions['ownerSource']}
     */
    this.ownerSource = ownerSource;

    /**
     * @private
     * @type {ActionsFactoryInitOptions['onSelectElement']}
     */
    this.onSelectElement = onSelectElement;

    /**
     * @private
     * @type {ActionsFactoryInitOptions['onDeselectElement']}
     */
    this.onDeselectElement = onDeselectElement;

    /**
     * @private
     * @type {ActionsFactoryInitOptions['onOpenChartEditor']}
     */
    this.onOpenChartEditor = onOpenChartEditor;

    /**
     * @private
     * @type {Set<ActionExecuteListener>}
     */
    this.executeListeners = new Set();

    /**
     * May contain only action with `changeType` equal to `'continuous'`
     * @private
     * @type {Utils.AtmWorkflow.ChartsDashboardEditor.SectionsEditorActions.ChangeElementPropertyAction | null}
     */
    this.activeChangeElementPropertyAction = null;
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
   * @public
   * @param {Omit<ChangeElementPropertyActionContext, 'onSelectElement'>} context
   * @returns {Utils.AtmWorkflow.ChartsDashboardEditor.SectionsEditorActions.ChangeElementPropertyAction}
   */
  createChangeElementPropertyAction(context) {
    let action = this.activeChangeElementPropertyAction;
    if (action) {
      const previousValueLength = String(action.previousValue).length;
      const latestValueLength = String(action.newValue).length;
      const newValueLength = String(context.newValue).length;
      if (
        // different element
        action.element !== context.element ||
        // different property
        action.propertyName !== context.propertyName ||
        // non-continuous change type
        context.changeType !== 'continuous' ||
        // value replaced with content of the same length
        latestValueLength === newValueLength ||
        // different change kind, like insertion after previous deletion (and reversed)
        Math.sign(latestValueLength - previousValueLength) !==
        Math.sign(newValueLength - latestValueLength)
      ) {
        action = null;
      }
    }

    if (!action) {
      action = this.attachExecuteListener(ChangeElementPropertyAction.create({
        ownerSource: this.ownerSource,
        context: {
          onSelectElement: this.onSelectElement,
          ...context,
        },
      }));
      if (action.changeType === 'continuous') {
        setTimeout(() => {
          if (this.activeChangeElementPropertyAction === action) {
            this.activeChangeElementPropertyAction = null;
          }
        }, 2000);
      }
    } else {
      set(action, 'context', {
        ...action.context,
        ...context,
      });
    }

    this.activeChangeElementPropertyAction =
      action.changeType === 'continuous' ? action : null;

    return action;
  }

  /**
   * @public
   * @returns {void}
   */
  interruptActiveChangeElementPropertyAction() {
    this.activeChangeElementPropertyAction = null;
  }

  /**
   * @public
   * @param {Omit<EditChartContentActionContext, 'onOpenChartEditor'>} context
   * @returns {Utils.AtmWorkflow.ChartsDashboardEditor.SectionsEditorActions.EditChartContentAction}
   */
  createEditChartContentAction(context) {
    return this.attachExecuteListener(EditChartContentAction.create({
      ownerSource: this.ownerSource,
      context: {
        onOpenChartEditor: this.onOpenChartEditor,
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
        this.executeListeners.forEach((listener) => listener(action, result));
      }
    });
    return action;
  }
}
