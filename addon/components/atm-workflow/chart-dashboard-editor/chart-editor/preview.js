/**
 * Shows preview of the currently edited chart. Uses random data to visualize
 * series provided by user in the editor.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { inject as service } from '@ember/service';
import layout from 'onedata-gui-common/templates/components/atm-workflow/chart-dashboard-editor/chart-editor/preview';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  layout,
  classNames: ['chart-editor-preview'],

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.atmWorkflow.chartDashboardEditor.chartEditor.preview',

  /**
   * @virtual
   * @type {Utils.AtmWorkflow.ChartDashboardEditor.Chart}
   */
  chart: undefined,
});
