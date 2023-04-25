import Component from '@ember/component';
import { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { ElementType } from 'onedata-gui-common/utils/atm-workflow/charts-dashboard-editor';
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
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.ActionsFactory}
   */
  actionsFactory: undefined,

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
  },
});
