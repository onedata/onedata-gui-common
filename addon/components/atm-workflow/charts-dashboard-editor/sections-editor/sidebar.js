/**
 * Sidebar for sections editor. Contains details of selected element.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { inject as service } from '@ember/service';
import PerfectScrollbarElement from 'onedata-gui-common/components/perfect-scrollbar-element';
import { ElementType } from 'onedata-gui-common/utils/atm-workflow/charts-dashboard-editor';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import layout from 'onedata-gui-common/templates/components/atm-workflow/charts-dashboard-editor/sections-editor/sidebar';

export default PerfectScrollbarElement.extend(I18n, {
  layout,
  classNames: ['sidebar'],

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.atmWorkflow.chartsDashboardEditor.sectionsEditor.sidebar',

  /**
   * @virtual
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.Chart | Utils.AtmWorkflow.ChartsDashboardEditor.Section | null}
   */
  selectedElement: null,

  /**
   * @virtual optional
   * @type {boolean}
   */
  hasValidationErrors: false,

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
