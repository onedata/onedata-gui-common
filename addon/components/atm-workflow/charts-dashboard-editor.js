/**
 * An editor component for automation charts dashboard.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed, set } from '@ember/object';
import { inject as service } from '@ember/service';
import layout from 'onedata-gui-common/templates/components/atm-workflow/charts-dashboard-editor';
import {
  ActionsFactory,
  UndoManager,
  createModelFromSpec,
  createNewSection,
  isChartElementType,
} from 'onedata-gui-common/utils/atm-workflow/charts-dashboard-editor';
import { ElementType } from 'onedata-gui-common/utils/atm-workflow/charts-dashboard-editor';

export default Component.extend({
  layout,
  classNames: ['charts-dashboard-editor'],

  i18n: service(),

  /**
   * @virtual
   * @type {AtmTimeSeriesDashboardSpec}
   */
  dashboardSpec: undefined,

  /**
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.ViewState}
   */
  viewState: undefined,

  /**
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.ActionsFactory}
   */
  actionsFactory: undefined,

  /**
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.UndoManager}
   */
  undoManager: undefined,

  /**
   * @type {ComputedProperty<Utils.AtmWorkflow.ChartsDashboardEditor.Model>}
   */
  model: computed('dashboardSpec', function model() {
    return createModelFromSpec(this.dashboardSpec, this);
  }),

  /**
   * @override
   */
  init() {
    this._super(...arguments);

    const undoManager = UndoManager.create();
    const actionsFactory = new ActionsFactory({
      ownerSource: this,
      changeViewState: (...args) => this.changeViewState(...args),
    });
    actionsFactory.addExecuteListener((action, result) => {
      if (!result.undo) {
        undoManager.addActionToHistory(action);
      }
    });

    this.setProperties({
      actionsFactory,
      undoManager,
    });

    this.resetViewState();
  },

  /**
   * @override
   */
  willDestroyElement() {
    try {
      this.cacheFor('model')?.destroy();
      this.actionsFactory.destroy();
      this.undoManager.destroy();
      this.setProperties({
        model: undefined,
        actionsFactory: undefined,
        undoManager: undefined,
      });
    } finally {
      this._super(...arguments);
    }
  },

  /**
   * @returns {void}
   */
  resetViewState() {
    this.changeViewState({ elementToSelect: this.model?.rootSection ?? null });
  },

  /**
   * @param {Utils.AtmWorkflow.ChartsDashboardEditor.ViewStateChange} viewStateChange
   * @returns {void}
   */
  changeViewState(viewStateChange) {
    const newViewState = this.viewState ? { ...this.viewState } : {
      selectedSectionElement: null,
      isChartEditorActive: false,
      selectedChartElement: null,
    };

    // Deselect specified elements
    viewStateChange.elementsToDeselect?.forEach((elementToDeselect) => {
      if (newViewState.selectedSectionElement === elementToDeselect) {
        // Deselection of section-level element causes chart editor close
        // automatically.
        newViewState.selectedSectionElement = null;
        newViewState.isChartEditorActive = false;
        newViewState.selectedChartElement = null;
      } else if (newViewState.selectedChartElement === elementToDeselect) {
        newViewState.selectedChartElement = null;
      }
    });

    if (viewStateChange.elementToSelect !== undefined) {
      if (!viewStateChange.elementToSelect) {
        // `elementToSelect` was intentionally set to `null` - clear selection
        newViewState.selectedSectionElement = null;
        newViewState.isChartEditorActive = false;
        newViewState.selectedChartElement = null;
      } else if (isChartElementType(viewStateChange.elementToSelect.elementType)) {
        // Chart element selection. We need to find parent chart...
        let chart = viewStateChange.elementToSelect.parent;
        while (chart && chart.elementType !== ElementType.Chart) {
          chart = chart.parent;
        }
        if (chart) {
          // ... to select that chart and its inner element.
          newViewState.selectedSectionElement = chart;
          newViewState.isChartEditorActive = true;
          newViewState.selectedChartElement = viewStateChange.elementToSelect;
        }
      } else {
        // Section-level element selection. We deselect chart-level element
        // (if there was any). Chart editor is opened only if it was directly
        // requested `viewStateChange.isChartEditorActive`.
        newViewState.selectedSectionElement = viewStateChange.elementToSelect;
        newViewState.isChartEditorActive =
          viewStateChange.elementToSelect.elementType === ElementType.Chart &&
          Boolean(viewStateChange.isChartEditorActive);
        newViewState.selectedChartElement = null;
      }
    } else if (viewStateChange.isChartEditorActive !== undefined) {
      // Only state of the chart editor visibility is changing.
      if (newViewState.selectedSectionElement?.elementType === ElementType.Chart) {
        newViewState.isChartEditorActive = Boolean(viewStateChange.isChartEditorActive);
      } else {
        newViewState.isChartEditorActive = false;
      }
    }

    if (this.viewState?.selectedSectionElement !== newViewState.selectedSectionElement) {
      if (this.viewState?.selectedSectionElement) {
        set(this.viewState.selectedSectionElement, 'isSelected', false);
      }
      if (newViewState.selectedSectionElement) {
        set(newViewState.selectedSectionElement, 'isSelected', true);
      }
    }

    if (this.viewState?.selectedChartElement !== newViewState.selectedChartElement) {
      if (this.viewState?.selectedChartElement) {
        set(this.viewState.selectedChartElement, 'isSelected', false);
      }
      if (newViewState.selectedChartElement) {
        set(newViewState.selectedChartElement, 'isSelected', true);
      }
    }

    this.set('viewState', newViewState);
  },

  actions: {
    /**
     * @returns {void}
     */
    createDashboard() {
      if (this.model.rootSection) {
        return;
      }

      set(this.model, 'rootSection', createNewSection(this.i18n, this, true));
      this.resetViewState();
    },

    /**
     * @returns {void}
     */
    removeDashboard() {
      const rootSection = this.model.rootSection;
      if (!rootSection) {
        return;
      }

      rootSection.destroy();
      set(this.model, 'rootSection', null);
      this.resetViewState();
    },

    /**
     * @param {Utils.AtmWorkflow.ChartsDashboardEditor.ViewStateChange} viewStateChange
     * @returns {void}
     */
    changeViewState(viewStateChange) {
      this.changeViewState(viewStateChange);
    },
  },
});
