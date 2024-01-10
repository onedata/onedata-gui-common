/**
 * Shows axes list and allows to perform operations on its items (creation,
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
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { ElementType } from 'onedata-gui-common/utils/atm-workflow/charts-dashboard-editor';
import { ElementsListItemModel } from './elements-list';
import layout from 'onedata-gui-common/templates/components/atm-workflow/charts-dashboard-editor/chart-editor/axes-list';

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
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.EditorContext}
   */
  editorContext: undefined,

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

    const newModels = this.chart?.axes.map((axis) => {
      const existingModel = existingModelsMap.get(axis);
      if (existingModel) {
        existingModelsMap.delete(axis);
        return existingModel;
      } else {
        return AxesListItemModel.create({ item: axis });
      }
    }) ?? [];

    existingModelsMap.forEach((model) => model.destroy());
    this.set('itemModels', newModels);
  },

  actions: {
    /**
     * @returns {void}
     */
    addAxis() {
      const action = this.editorContext.actionsFactory.createAddElementAction({
        newElementType: ElementType.Axis,
        targetElement: this.chart,
      });
      action.execute();
    },
  },
});

const AxesListItemModel = ElementsListItemModel.extend({
  /**
   * @override
   */
  renderer: 'atm-workflow/charts-dashboard-editor/chart-editor/axes-list-item',
});
