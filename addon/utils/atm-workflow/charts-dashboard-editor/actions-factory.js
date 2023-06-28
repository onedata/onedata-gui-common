/**
 * Creates actions used by dashboard editor. Internally monitors each action
 * execution and notifies about every such event through execute listeners (see
 * `addExecuteListener` and `removeExecuteListeners`).
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { set } from '@ember/object';
import AddElementAction from './actions/add-element-action';
import MoveElementAction from './actions/move-element-action';
import DuplicateElementAction from './actions/duplicate-element-action';
import RemoveElementAction from './actions/remove-element-action';
import SelectElementAction from './actions/select-element-action';
import ChangeElementPropertyAction from './actions/change-element-property-action';
import EditChartContentAction from './actions/edit-chart-content-action';
import EndChartContentEditionAction from './actions/end-chart-content-edition-action';
import AddFunctionAction from './actions/add-function-action';

/**
 * @typedef {(action: Utils.Action, result: Utils.ActionResult) => void} ActionExecuteListener
 */

/**
 * @typedef {(newElement: Utils.AtmWorkflow.ChartsDashboardEditor.DashboardElement) => void} CreateElementListener
 */

/**
 * @typedef {Object} ActionsFactoryInitOptions
 * @property {unknown} ownerSource
 * @property {Array<ChartsDashboardEditorDataSource>} dataSources
 * @property {(viewStateChange: Utils.AtmWorkflow.ChartsDashboardEditor.ViewStateChange) => void} changeViewState
 */

export default class ActionsFactory {
  /**
   * @param {ActionsFactoryInitOptions} initOptions
   */
  constructor({
    ownerSource,
    dataSources,
    changeViewState,
  } = {}) {
    /**
     * @public
     * @type {Array<ChartsDashboardEditorDataSource>}
     */
    this.dataSources = dataSources;

    /**
     * @private
     * @type {ActionsFactoryInitOptions['ownerSource']}
     */
    this.ownerSource = ownerSource;

    /**
     * @private
     * @type {ActionsFactoryInitOptions['changeViewState']}
     */
    this.changeViewState = changeViewState;

    /**
     * @private
     * @type {Set<ActionExecuteListener>}
     */
    this.executeListeners = new Set();

    /**
     * @private
     * @type {Set<CreateElementListener>}
     */
    this.createElementListeners = new Set();

    /**
     * May contain only action with `changeType` equal to `'continuous'`
     * @private
     * @type {Utils.AtmWorkflow.ChartsDashboardEditor.Actions.ChangeElementPropertyAction | null}
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
    this.createElementListeners.clear();
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
   * @param {CreateElementListener} listener
   * @returns {void}
   */
  addCreateElementListener(listener) {
    this.createElementListeners.add(listener);
  }

  /**
   * @public
   * @param {CreateElementListener} listener
   * @returns {void}
   */
  removeCreateElementListener(listener) {
    this.createElementListeners.delete(listener);
  }

  /**
   * @public
   * @param {Omit<AddElementActionContext, 'changeViewState' | 'dataSources'>} context
   * @returns {Utils.AtmWorkflow.ChartsDashboardEditor.Actions.AddElementAction}
   */
  createAddElementAction(context) {
    return this.attachCreateElementListener(
      this.attachExecuteListener(
        AddElementAction.create({
          ownerSource: this.ownerSource,
          context: {
            dataSources: this.dataSources,
            changeViewState: this.changeViewState,
            ...context,
          },
        })
      )
    );
  }

  /**
   * @public
   * @param {Omit<MoveElementActionContext, 'changeViewState'} context
   * @returns {Utils.AtmWorkflow.ChartsDashboardEditor.Actions.MoveElementAction}
   */
  createMoveElementAction(context) {
    return this.attachExecuteListener(MoveElementAction.create({
      ownerSource: this.ownerSource,
      context: {
        changeViewState: this.changeViewState,
        ...context,
      },
    }));
  }

  /**
   * @public
   * @param {Omit<DuplicateElementActionContext, 'changeViewState'>} context
   * @returns {Utils.AtmWorkflow.ChartsDashboardEditor.Actions.DuplicateElementAction}
   */
  createDuplicateElementAction(context) {
    return this.attachExecuteListener(DuplicateElementAction.create({
      ownerSource: this.ownerSource,
      context: {
        changeViewState: this.changeViewState,
        ...context,
      },
    }));
  }

  /**
   * @public
   * @param {Omit<RemoveElementActionContext, 'changeViewState'>} context
   * @returns {Utils.AtmWorkflow.ChartsDashboardEditor.Actions.RemoveElementAction}
   */
  createRemoveElementAction(context) {
    return this.attachExecuteListener(RemoveElementAction.create({
      ownerSource: this.ownerSource,
      context: {
        changeViewState: this.changeViewState,
        ...context,
      },
    }));
  }

  /**
   * @public
   * @param {Omit<SelectElementActionContext, 'changeViewState'>} context
   * @returns {Utils.AtmWorkflow.ChartsDashboardEditor.Actions.SelectElementAction}
   */
  createSelectElementAction(context) {
    return this.attachExecuteListener(SelectElementAction.create({
      ownerSource: this.ownerSource,
      context: {
        changeViewState: this.changeViewState,
        ...context,
      },
    }));
  }

  /**
   * @public
   * @param {Omit<ChangeElementPropertyActionContext, 'changeViewState'>} context
   * @returns {Utils.AtmWorkflow.ChartsDashboardEditor.Actions.ChangeElementPropertyAction}
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
          changeViewState: this.changeViewState,
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
   * @param {Omit<EditChartContentActionContext, 'changeViewState'>} context
   * @returns {Utils.AtmWorkflow.ChartsDashboardEditor.Actions.EditChartContentAction}
   */
  createEditChartContentAction(context) {
    return this.attachExecuteListener(EditChartContentAction.create({
      ownerSource: this.ownerSource,
      context: {
        changeViewState: this.changeViewState,
        ...context,
      },
    }));
  }

  /**
   * @public
   * @param {Omit<EndChartContentEditionActionContext, 'changeViewState'>} [context]
   * @returns {Utils.AtmWorkflow.ChartsDashboardEditor.Actions.EndChartContentEditionAction}
   */
  createEndChartContentEditionAction(context = {}) {
    return this.attachExecuteListener(EndChartContentEditionAction.create({
      ownerSource: this.ownerSource,
      context: {
        changeViewState: this.changeViewState,
        ...context,
      },
    }));
  }

  /**
   * @public
   * @param {Omit<AddFunctionActionContext, 'changeViewState' | 'dataSources'>} context
   * @returns {Utils.AtmWorkflow.ChartsDashboardEditor.Actions.AddFunctionAction}
   */
  createAddFunctionAction(context) {
    return this.attachCreateElementListener(
      this.attachExecuteListener(
        AddFunctionAction.create({
          ownerSource: this.ownerSource,
          context: {
            dataSources: this.dataSources,
            changeViewState: this.changeViewState,
            ...context,
          },
        })
      )
    );
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

  /**
   * @private
   * @param {Utils.Action} action
   * @returns {Utils.Action}
   */
  attachCreateElementListener(action) {
    let wasCalled = false;
    action.addExecuteHook((result) => {
      const createdElement = action.newFunction ?? action.newElement;
      if (result?.status === 'done' && !result?.undo && createdElement && !wasCalled) {
        wasCalled = true;
        this.createElementListeners.forEach((listener) => listener(createdElement));
      }
    });
    return action;
  }
}
