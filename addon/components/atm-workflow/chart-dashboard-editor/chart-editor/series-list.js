/**
 * Shows series list and allows to perform operations on its items (creation,
 * removal, duplication etc.).
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

// TODO: VFS-10649 Consider to join series, series-group and axes lists
// into a single generic component.

import Component from '@ember/component';
import { observer } from '@ember/object';
import { inject as service } from '@ember/service';
import { neq, or, raw } from 'ember-awesome-macros';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { ElementType } from 'onedata-gui-common/utils/atm-workflow/chart-dashboard-editor';
import { ElementsListItemModel } from './elements-list';
import layout from 'onedata-gui-common/templates/components/atm-workflow/chart-dashboard-editor/chart-editor/series-list';

export default Component.extend(I18n, {
  layout,
  classNames: ['series-list', 'chart-elements-list-container'],

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.atmWorkflow.chartDashboardEditor.chartEditor.seriesList',

  /**
   * @virtual
   * @type {Utils.AtmWorkflow.ChartDashboardEditor.Chart}
   */
  chart: undefined,

  /**
   * @virtual
   * @type {Utils.AtmWorkflow.ChartDashboardEditor.EditorContext}
   */
  editorContext: undefined,

  /**
   * @virtual optional
   * @type {Utils.AtmWorkflow.ChartDashboardEditor.Chart | Utils.AtmWorkflow.ChartDashboardEditor.SeriesGroup | Utils.AtmWorkflow.ChartDashboardEditor.Axis}
   */
  seriesSource: undefined,

  /**
   * @type {Array<SeriesListItemModel>}
   */
  itemModels: undefined,

  /**
   * @type {ComputedProperty<Utils.AtmWorkflow.ChartDashboardEditor.Chart | Utils.AtmWorkflow.ChartDashboardEditor.SeriesGroup | Utils.AtmWorkflow.ChartDashboardEditor.Axis>}
   */
  effSeriesSource: or('seriesSource', 'chart'),

  /**
   * @type {ComputedProperty<boolean>}
   */
  hideActions: neq('effSeriesSource.elementType', raw(ElementType.Chart)),

  itemModelsSetter: observer('effSeriesSource.series.[]', function itemModelsSetter() {
    this.calculateItemModels();
  }),

  /**
   * @override
   */
  init() {
    this._super(...arguments);
    this.calculateItemModels();
  },

  calculateItemModels() {
    const existingModels = this.itemModels ?? [];
    const existingModelsMap = new Map(existingModels.map((model) => [model.item, model]));

    const newModels = this.effSeriesSource?.series.map((series) => {
      const existingModel = existingModelsMap.get(series);
      if (existingModel) {
        existingModelsMap.delete(series);
        return existingModel;
      } else {
        return SeriesListItemModel.create({ item: series });
      }
    }) ?? [];

    existingModelsMap.forEach((model) => model.destroy());
    this.set('itemModels', newModels);
  },

  actions: {
    /**
     * @returns {void}
     */
    addSeries() {
      const action = this.editorContext.actionsFactory.createAddElementAction({
        newElementType: ElementType.Series,
        targetElement: this.chart,
      });
      action.execute();
    },
  },
});

const SeriesListItemModel = ElementsListItemModel.extend({
  /**
   * @override
   */
  renderer: 'atm-workflow/chart-dashboard-editor/chart-editor/series-list-item',
});
