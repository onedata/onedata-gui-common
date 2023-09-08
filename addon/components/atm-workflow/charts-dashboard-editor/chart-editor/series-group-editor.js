/**
 * Editor dedicated to modify chart series group element.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import layout from 'onedata-gui-common/templates/components/atm-workflow/charts-dashboard-editor/chart-editor/series-group-editor';

export default Component.extend(I18n, {
  classNames: ['series-group-editor', 'element-editor'],
  layout,

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.atmWorkflow.chartsDashboardEditor.chartEditor.seriesGroupEditor',

  /**
   * @virtual
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.SeriesGroup}
   */
  chartElement: undefined,

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
});
