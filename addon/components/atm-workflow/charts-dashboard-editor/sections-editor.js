/**
 * An editor component for dashboard sections. Allows to manage sections and
 * charts existence and layout.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { observer, set } from '@ember/object';
import { inject as service } from '@ember/service';
import layout from 'onedata-gui-common/templates/components/atm-workflow/charts-dashboard-editor/sections-editor';
import ActionsFactory from 'onedata-gui-common/utils/atm-workflow/charts-dashboard-editor/sections-editor-actions/actions-factory';
import {
  ElementType,
  UndoManager,
  EdgeScroller,
} from 'onedata-gui-common/utils/atm-workflow/charts-dashboard-editor';

export default Component.extend({
  layout,
  classNames: ['sections-editor'],

  dragDrop: service(),

  /**
   * @virtual
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.Section}
   */
  rootSection: undefined,

  /**
   * @virtual
   * @type {() => void}
   */
  onRemoveDashboard: undefined,

  /**
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.Chart | Utils.AtmWorkflow.ChartsDashboardEditor.Section | null}
   */
  selectedElement: null,

  /**
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.SectionsEditorActionsFactory}
   */
  actionsFactory: undefined,

  /**
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.UndoManager}
   */
  undoManager: undefined,

  /**
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.EdgeScroller}
   */
  edgeScroller: undefined,

  edgeScrollerEnabler: observer(
    'dragDrop.draggedElementModel.elementType',
    function edgeScrollerEnabler() {
      const draggedElementType = this.dragDrop.draggedElementModel?.elementType;
      if (
        draggedElementType === ElementType.Chart ||
        draggedElementType === ElementType.Section
      ) {
        this.edgeScroller?.enable();
      } else {
        this.edgeScroller?.disable();
      }
    }
  ),

  /**
   * @override
   */
  init() {
    this._super(...arguments);

    const actionsFactory = new ActionsFactory({
      ownerSource: this,
      onSelectElement: (element) => this.selectElement(element),
      onDeselectElement: (element) => this.deselectElement(element),
    });
    const undoManager = UndoManager.create();
    actionsFactory.addExecuteListener((action, result) => {
      if (!result.undo) {
        undoManager.addActionToHistory(action);
      }
    });

    this.setProperties({
      actionsFactory,
      undoManager,
    });

    this.actionsFactory
      .createSelectElementAction({ elementToSelect: this.rootSection })
      .execute();

    this.edgeScrollerEnabler();
  },

  /**
   * @override
   */
  didInsertElement() {
    this._super(...arguments);
    this.set('edgeScroller', new EdgeScroller(
      this.element.querySelector('.dashboard-visualiser')
    ));
  },

  /**
   * @override
   */
  willDestroyElement() {
    try {
      this.actionsFactory.destroy();
      this.undoManager.destroy();
      this.edgeScroller?.destroy();
      this.setProperties({
        actionsFactory: undefined,
        undoManager: undefined,
        edgeScroller: undefined,
      });
    } finally {
      this._super(...arguments);
    }
  },

  /**
   * @param {Utils.AtmWorkflow.ChartsDashboardEditor.Chart | Utils.AtmWorkflow.ChartsDashboardEditor.Section | null} elementToSelect
   * @returns {void}
   */
  selectElement(elementToSelect) {
    if (this.selectedElement === elementToSelect) {
      return;
    }

    if (this.selectedElement) {
      set(this.selectedElement, 'isSelected', false);
    }
    if (elementToSelect) {
      set(elementToSelect, 'isSelected', true);
    }
    this.set('selectedElement', elementToSelect);
  },

  /**
   * @param {Utils.AtmWorkflow.ChartsDashboardEditor.Chart | Utils.AtmWorkflow.ChartsDashboardEditor.Section} elementToDeselect
   * @returns {void}
   */
  deselectElement(elementToDeselect) {
    if (this.selectedElement === elementToDeselect) {
      this.selectElement(null);
    }
  },

  /**
   * @returns {HTMLDivElement | null}
   */
  getWorkspaceElement() {
    return this.element?.querySelector('.dashboard-visualiser') ?? null;
  },

  actions: {
    /**
     * @param {MouseEvent} event
     * @returns {void}
     */
    workspaceClick(event) {
      if (event.target === this.getWorkspaceElement()) {
        const action = this.actionsFactory
          .createSelectElementAction({ elementToSelect: null });
        action.execute();
      }
    },
  },
});
