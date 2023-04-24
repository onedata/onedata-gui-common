/**
 * Sidebar for sections editor. Contains details of selected element.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import PerfectScrollbarElement from 'onedata-gui-common/components/perfect-scrollbar-element';
import { ElementType } from 'onedata-gui-common/utils/atm-workflow/charts-dashboard-editor';
import layout from 'onedata-gui-common/templates/components/atm-workflow/charts-dashboard-editor/sections-editor/sidebar';

export default PerfectScrollbarElement.extend({
  layout,
  classNames: ['sidebar'],

  /**
   * @virtual
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.Chart | Utils.AtmWorkflow.ChartsDashboardEditor.Section | null}
   */
  selectedElement: null,

  /**
   * @virtual
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.ActionsFactory}
   */
  actionsFactory: undefined,

  /**
   * @type {Object<string, Utils.AtmWorkflow.ChartsDashboardEditor.ElementType>}
   */
  ElementType,
});
