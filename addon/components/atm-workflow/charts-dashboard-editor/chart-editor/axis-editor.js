/**
 * Editor dedicated to modify chart axis element.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from 'onedata-gui-common/templates/components/atm-workflow/charts-dashboard-editor/chart-editor/axis-editor';

export default Component.extend({
  classNames: ['axis-editor', 'element-editor'],
  layout,

  /**
   * @virtual
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.Axis}
   */
  chartElement: undefined,

  /**
   * @virtual
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.ActionsFactory}
   */
  actionsFactory: undefined,
});
