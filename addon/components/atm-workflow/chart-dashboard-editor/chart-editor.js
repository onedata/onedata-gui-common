/**
 * An editor component for dashboard charts. Allows to manage chart elements
 * with a live preview of introduced changes.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from 'onedata-gui-common/templates/components/atm-workflow/chart-dashboard-editor/chart-editor';

export default Component.extend({
  layout,
  classNames: ['chart-editor'],

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
   * @virtual optional
   * @type {Utils.AtmWorkflow.ChartDashboardEditor.ChartElement | null}
   */
  selectedElement: null,
});
