/**
 * Sidebar for sections editor. Contains details of selected element.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { inject as service } from '@ember/service';
import PerfectScrollbarElement from 'onedata-gui-common/components/perfect-scrollbar-element';
import { ElementType } from 'onedata-gui-common/utils/atm-workflow/chart-dashboard-editor';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import layout from 'onedata-gui-common/templates/components/atm-workflow/chart-dashboard-editor/sections-editor/sidebar';

export default PerfectScrollbarElement.extend(I18n, {
  layout,
  classNames: ['sidebar'],

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.atmWorkflow.chartDashboardEditor.sectionsEditor.sidebar',

  /**
   * @virtual
   * @type {Utils.AtmWorkflow.ChartDashboardEditor.Chart | Utils.AtmWorkflow.ChartDashboardEditor.Section | null}
   */
  selectedElement: null,

  /**
   * @virtual
   * @type {boolean}
   */
  hasValidationErrors: false,

  /**
   * @virtual
   * @type {Utils.AtmWorkflow.ChartDashboardEditor.EditorContext}
   */
  editorContext: undefined,

  /**
   * @type {Object<string, Utils.AtmWorkflow.ChartDashboardEditor.ElementType>}
   */
  ElementType,
});
