import Component from '@ember/component';
import { observer } from '@ember/object';
import { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { ElementType } from 'onedata-gui-common/utils/atm-workflow/charts-dashboard-editor';
import { ElementsListItemModel } from './elements-list';
import layout from 'onedata-gui-common/templates/components/atm-workflow/charts-dashboard-editor/chart-editor/series-list';

const SeriesListItemModel = ElementsListItemModel.extend({
  renderer: 'atm-workflow/charts-dashboard-editor/chart-editor/series-list-item',
});

export default Component.extend(I18n, {
  layout,
  classNames: ['series-list', 'chart-elements-list-container'],

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.atmWorkflow.chartsDashboardEditor.chartEditor.seriesList',

  /**
   * @virtual
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.Chart}
   */
  chart: undefined,

  /**
   * @virtual
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.ActionsFactory}
   */
  actionsFactory: undefined,

  /**
   * @type {Array<SeriesListItemModel>}
   */
  itemModels: undefined,

  itemModelsSetter: observer('chart.series.[]', function itemModelsSetter() {
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

    const newModels = this.chart.series.map((series) => {
      const existingModel = existingModelsMap.get(series);
      if (existingModel) {
        existingModelsMap.delete(series);
        return existingModel;
      } else {
        return SeriesListItemModel.create({ item: series });
      }
    });

    existingModelsMap.forEach((model) => model.destroy());
    this.set('itemModels', newModels);
  },

  actions: {
    /**
     * @returns {void}
     */
    addSeries() {
      const action = this.actionsFactory.createAddElementAction({
        newElementType: ElementType.Series,
        targetElement: this.chart,
      });
      action.execute();
    },
  },
});
