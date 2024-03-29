/**
 * An editor component for automation chart dashboard.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed, observer, set } from '@ember/object';
import { inject as service } from '@ember/service';
import layout from 'onedata-gui-common/templates/components/atm-workflow/chart-dashboard-editor';
import {
  EditorContext,
  ActionsFactory,
  UndoManager,
  createModelFromSpec,
  createNewSection,
  isChartElementType,
} from 'onedata-gui-common/utils/atm-workflow/chart-dashboard-editor';
import { ElementType } from 'onedata-gui-common/utils/atm-workflow/chart-dashboard-editor';

export default Component.extend({
  layout,
  classNames: ['chart-dashboard-editor'],
  classNameBindings: ['isReadOnly:read-only'],

  i18n: service(),

  /**
   * One of dashboardSpec or dashboardModel has to be provided
   * @virtual optional
   * @type {AtmTimeSeriesDashboardSpec}
   */
  dashboardSpec: undefined,

  /**
   * One of dashboardSpec or dashboardModel has to be provided
   * @virtual optional
   * @type {Utils.AtmWorkflow.ChartDashboardEditor.Model}
   */
  dashboardModel: undefined,

  /**
   * Required if dashboardSpec has been provided
   * @virtual optional
   * @type {Array<ChartDashboardEditorDataSource>}
   */
  dataSources: undefined,

  /**
   * @virtual optional
   * @type {boolean}
   */
  isReadOnly: false,

  /**
   * @type {Utils.AtmWorkflow.ChartDashboardEditor.ViewState}
   */
  viewState: undefined,

  /**
   * @type {Utils.AtmWorkflow.ChartDashboardEditor.UndoManager}
   */
  undoManager: undefined,

  /**
   * @type {Utils.AtmWorkflow.ChartDashboardEditor.EditorContext | null}
   */
  editorContextCache: null,

  /**
   * @type {ComputedProperty<Utils.AtmWorkflow.ChartDashboardEditor.EditorContext>}
   */
  editorContext: computed('isReadOnly', function editorContext() {
    if (!this.editorContextCache) {
      const newContext = this.createNewEditorContext();
      this.set('editorContextCache', newContext);
      return newContext;
    }

    if (this.editorContextCache.isReadOnly !== this.isReadOnly) {
      set(this.editorContextCache, 'isReadOnly', this.isReadOnly);
    }
    return this.editorContextCache;
  }),

  /**
   * @type {ComputedProperty<Utils.AtmWorkflow.ChartDashboardEditor.Model>}
   */
  model: computed('dashboardModel', 'dashboardSpec', function model() {
    return this.dashboardModel ?? createModelFromSpec(this.dashboardSpec, this);
  }),

  dataSourcesObserver: observer('dataSources', function dataSourcesObserver() {
    if (this.model !== this.dashboardModel) {
      set(this.model, 'dataSources', this.dataSources ?? []);
    }
  }),

  /**
   * @override
   */
  init() {
    this._super(...arguments);

    this.set('undoManager', UndoManager.create());
    this.resetViewState();
  },

  /**
   * @override
   */
  willDestroyElement() {
    try {
      this.removeSelectionFromModel();
      if (this.cacheFor('model') !== this.dashboardModel) {
        this.cacheFor('model')?.destroy();
      }
      this.cacheFor('editorContext')?.destroy();
      this.undoManager.destroy();
      this.set('undoManager', undefined);
    } finally {
      this._super(...arguments);
    }
  },

  /**
   * @returns {void}
   */
  removeSelectionFromModel() {
    const rootSection = this.cacheFor('model')?.rootSection;
    if (!rootSection) {
      return;
    }
    [rootSection, ...rootSection.nestedElements()].forEach((element) => {
      if (element.isSelected) {
        set(element, 'isSelected', false);
      }
    });
  },

  /**
   * @returns {void}
   */
  resetViewState() {
    this.changeViewState({ elementToSelect: this.model?.rootSection ?? null });
  },

  /**
   * @param {Utils.AtmWorkflow.ChartDashboardEditor.ViewStateChange} viewStateChange
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
      } else if (viewStateChange.elementToSelect.elementType === ElementType.Function) {
        // TODO: VFS-11104
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

  /**
   * @returns {Utils.AtmWorkflow.ChartDashboardEditor.EditorContext}
   */
  createNewEditorContext() {
    const actionsFactory = new ActionsFactory({
      ownerSource: this,
      changeViewState: (...args) => this.changeViewState(...args),
    });
    actionsFactory.addExecutionListener((action, result) => {
      if (!result.undo) {
        this.undoManager.addActionToHistory(action);
      }
    });

    return EditorContext.create({
      actionsFactory,
      isReadOnly: this.isReadOnly,
    });
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
     * @param {Utils.AtmWorkflow.ChartDashboardEditor.ViewStateChange} viewStateChange
     * @returns {void}
     */
    changeViewState(viewStateChange) {
      this.changeViewState(viewStateChange);
    },
  },
});
