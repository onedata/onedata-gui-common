/**
 * Shows series groups list and allows to perform operations on its items
 * (creation, removal, duplication etc.).
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
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { ElementType } from 'onedata-gui-common/utils/atm-workflow/charts-dashboard-editor';
import { ElementsListItemModel } from './elements-list';
import layout from 'onedata-gui-common/templates/components/atm-workflow/charts-dashboard-editor/chart-editor/series-groups-list';

export default Component.extend(I18n, {
  layout,
  classNames: ['series-groups-list', 'chart-elements-list-container'],

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.atmWorkflow.chartsDashboardEditor.chartEditor.seriesGroupsList',

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
   * @virtual optional
   * @type {boolean}
   */
  isReadOnly: false,

  /**
   * @type {Array<SeriesGroupListItemModel>}
   */
  itemModels: undefined,

  itemModelsSetter: observer('chart.seriesGroups.[]', function itemModelsSetter() {
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

    const newModels = this.chart?.seriesGroups.map((seriesGroup) => {
      const existingModel = existingModelsMap.get(seriesGroup);
      if (existingModel) {
        existingModelsMap.delete(seriesGroup);
        return existingModel;
      } else {
        return SeriesGroupListItemModel.create({ item: seriesGroup });
      }
    }) ?? [];

    existingModelsMap.forEach((model) => model.destroy());
    this.set('itemModels', newModels);
  },

  actions: {
    /**
     * @returns {void}
     */
    addSeriesGroup() {
      const action = this.actionsFactory.createAddElementAction({
        newElementType: ElementType.SeriesGroup,
        targetElement: this.chart,
      });
      action.execute();
    },
  },
});

const SeriesGroupListItemModel = ElementsListItemModel.extend({
  /**
   * @override
   */
  renderer: 'atm-workflow/charts-dashboard-editor/chart-editor/series-groups-list-item',

  nestedModelsSetter: observer(
    'item.seriesGroups.[]',
    function nestedModelsSetter() {
      const existingModels = this.nestedModels;
      const existingModelsMap = new Map(
        existingModels.map((model) => [model.item, model])
      );

      const newModels = this.item.seriesGroups.map((seriesGroup) => {
        const existingModel = existingModelsMap.get(seriesGroup);
        if (existingModel) {
          existingModelsMap.delete(seriesGroup);
          return existingModel;
        } else {
          return SeriesGroupListItemModel.create({ item: seriesGroup });
        }
      });

      existingModelsMap.forEach((model) => model.destroy());
      this.set('nestedModels', newModels);
    }
  ),

  /**
   * @override
   */
  init() {
    this._super(...arguments);
    this.nestedModelsSetter();
  },
});
