/**
 * Creates actions used by dashboard editor. Internally monitors each action
 * execution and notifies about every such event through execute listeners (see
 * `addExecutionListener` and `removeExecutionListeners`).
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
import DetachArgumentFunctionAction from './actions/detach-argument-function-action';
import RemoveFunctionAction from './actions/remove-function-action';

/**
 * @typedef {(action: Utils.Action, result: Utils.ActionResult) => void} ActionExecutionListener
 */

/**
 * @typedef {(newElement: Utils.AtmWorkflow.ChartDashboardEditor.DashboardElement) => void} ElementCreationListener
 */

/**
 * @typedef {Object} ActionsFactoryInitOptions
 * @property {unknown} ownerSource
 * @property {(viewStateChange: Utils.AtmWorkflow.ChartDashboardEditor.ViewStateChange) => void} changeViewState
 */

export default class ActionsFactory {
  /**
   * @param {ActionsFactoryInitOptions} initOptions
   */
  constructor({ ownerSource, changeViewState } = {}) {
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
     * @type {Set<ActionExecutionListener>}
     */
    this.executionListeners = new Set();

    /**
     * May contain only action with `changeType` equal to `'continuous'`
     * @private
     * @type {Utils.AtmWorkflow.ChartDashboardEditor.Actions.ChangeElementPropertyAction | null}
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
    this.executionListeners.clear();
  }

  /**
   * @public
   * @param {ActionExecutionListener} listener
   * @returns {void}
   */
  addExecutionListener(listener) {
    this.executionListeners.add(listener);
  }

  /**
   * @public
   * @param {ActionExecutionListener} listener
   * @returns {void}
   */
  removeExecutionListener(listener) {
    this.executionListeners.delete(listener);
  }

  /**
   * @public
   * @param {Omit<AddElementActionContext, 'changeViewState'>} context
   * @returns {Utils.AtmWorkflow.ChartDashboardEditor.Actions.AddElementAction}
   */
  createAddElementAction(context) {
    return this.attachExecutionListener(
      AddElementAction.create({
        ownerSource: this.ownerSource,
        context: {
          changeViewState: this.changeViewState,
          ...context,
        },
      })
    );
  }

  /**
   * @public
   * @param {Omit<MoveElementActionContext, 'changeViewState'} context
   * @returns {Utils.AtmWorkflow.ChartDashboardEditor.Actions.MoveElementAction}
   */
  createMoveElementAction(context) {
    return this.attachExecutionListener(MoveElementAction.create({
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
   * @returns {Utils.AtmWorkflow.ChartDashboardEditor.Actions.DuplicateElementAction}
   */
  createDuplicateElementAction(context) {
    return this.attachExecutionListener(DuplicateElementAction.create({
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
   * @returns {Utils.AtmWorkflow.ChartDashboardEditor.Actions.RemoveElementAction}
   */
  createRemoveElementAction(context) {
    return this.attachExecutionListener(RemoveElementAction.create({
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
   * @returns {Utils.AtmWorkflow.ChartDashboardEditor.Actions.SelectElementAction}
   */
  createSelectElementAction(context) {
    return this.attachExecutionListener(SelectElementAction.create({
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
   * @returns {Utils.AtmWorkflow.ChartDashboardEditor.Actions.ChangeElementPropertyAction}
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
      action = this.attachExecutionListener(ChangeElementPropertyAction.create({
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
   * @returns {Utils.AtmWorkflow.ChartDashboardEditor.Actions.EditChartContentAction}
   */
  createEditChartContentAction(context) {
    return this.attachExecutionListener(EditChartContentAction.create({
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
   * @returns {Utils.AtmWorkflow.ChartDashboardEditor.Actions.EndChartContentEditionAction}
   */
  createEndChartContentEditionAction(context = {}) {
    return this.attachExecutionListener(EndChartContentEditionAction.create({
      ownerSource: this.ownerSource,
      context: {
        changeViewState: this.changeViewState,
        ...context,
      },
    }));
  }

  /**
   * @public
   * @param {Omit<AddFunctionActionContext, 'changeViewState'>} context
   * @returns {Utils.AtmWorkflow.ChartDashboardEditor.Actions.AddFunctionAction}
   */
  createAddFunctionAction(context) {
    return this.attachExecutionListener(
      AddFunctionAction.create({
        ownerSource: this.ownerSource,
        context: {
          changeViewState: this.changeViewState,
          ...context,
        },
      })
    );
  }

  /**
   * @public
   * @param {Omit<DetachArgumentFunctionActionContext, 'changeViewState'>} context
   * @returns {Utils.AtmWorkflow.ChartDashboardEditor.Actions.DetachArgumentFunctionAction}
   */
  createDetachArgumentFunctionAction(context) {
    return this.attachExecutionListener(
      DetachArgumentFunctionAction.create({
        ownerSource: this.ownerSource,
        context: {
          changeViewState: this.changeViewState,
          ...context,
        },
      })
    );
  }

  /**
   * @public
   * @param {Omit<RemoveFunctionActionContext, 'changeViewState'>} context
   * @returns {Utils.AtmWorkflow.ChartDashboardEditor.Actions.RemoveFunctionAction}
   */
  createRemoveFunctionAction(context) {
    return this.attachExecutionListener(
      RemoveFunctionAction.create({
        ownerSource: this.ownerSource,
        context: {
          changeViewState: this.changeViewState,
          ...context,
        },
      })
    );
  }

  /**
   * @private
   * @param {Utils.Action} action
   * @returns {Utils.Action}
   */
  attachExecutionListener(action) {
    action.addExecuteHook((result) => {
      if (result?.status === 'done') {
        this.executionListeners.forEach((listener) => listener(action, result));
      }
    });
    return action;
  }
}
