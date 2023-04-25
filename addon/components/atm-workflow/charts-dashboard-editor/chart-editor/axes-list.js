import Component from '@ember/component';
import { observer } from '@ember/object';
import { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { ElementType } from 'onedata-gui-common/utils/atm-workflow/charts-dashboard-editor';
import { ElementsListItemModel } from './elements-list';
import layout from 'onedata-gui-common/templates/components/atm-workflow/charts-dashboard-editor/chart-editor/axes-list';

const AxesListItemModel = ElementsListItemModel.extend({
  renderer: 'atm-workflow/charts-dashboard-editor/chart-editor/axes-list-item',
});

export default Component.extend(I18n, {
  layout,
  classNames: ['axes-list', 'chart-elements-list-container'],

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.atmWorkflow.chartsDashboardEditor.chartEditor.axesList',

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
   * @type {Array<AxesListItemModel>}
   */
  itemModels: undefined,

  itemModelsSetter: observer('chart.axes.[]', function itemModelsSetter() {
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

    const newModels = this.chart.axes.map((axis) => {
      const existingModel = existingModelsMap.get(axis);
      if (existingModel) {
        existingModelsMap.delete(axis);
        return existingModel;
      } else {
        return AxesListItemModel.create({ item: axis });
      }
    });

    existingModelsMap.forEach((model) => model.destroy());
    this.set('itemModels', newModels);
  },

  actions: {
    /**
     * @returns {void}
     */
    addAxis() {
      const action = this.actionsFactory.createAddElementAction({
        newElementType: ElementType.Axis,
        targetElement: this.chart,
      });
      action.execute();
    },

    /**
     * @param {AxesListItemModel} itemModel
     * @returns {void}
     */
    selectAxis(itemModel) {
      const action = this.actionsFactory.createSelectElementAction({
        elementToSelect: itemModel.item,
      });
      action.execute();
    },
  },
});
