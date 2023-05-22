/**
 * Editor dedicated to modify chart series element.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from 'onedata-gui-common/templates/components/atm-workflow/charts-dashboard-editor/chart-editor/series-editor';

export default Component.extend({
  classNames: ['series-editor', 'element-editor'],
  layout,

  /**
   * @virtual
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.Series}
   */
  chartElement: undefined,

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
});
