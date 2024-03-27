/**
 * Editor dedicated to modify chart series element.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { conditional, raw } from 'ember-awesome-macros';
import { inject as service } from '@ember/service';
import { FunctionExecutionContext } from 'onedata-gui-common/utils/atm-workflow/chart-dashboard-editor';
import layout from 'onedata-gui-common/templates/components/atm-workflow/chart-dashboard-editor/chart-editor/series-editor';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  classNames: ['series-editor', 'element-editor'],
  layout,

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.atmWorkflow.chartDashboardEditor.chartEditor.seriesEditor',

  /**
   * @virtual
   * @type {Utils.AtmWorkflow.ChartDashboardEditor.Series}
   */
  chartElement: undefined,

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
   * @type {ComputedProperty<FunctionExecutionContext>}
   */
  functionExecutionContext: conditional(
    'chartElement.repeatPerPrefixedTimeSeries',
    raw(FunctionExecutionContext.RepeatedSeries),
    raw(FunctionExecutionContext.Series)
  ),
});
