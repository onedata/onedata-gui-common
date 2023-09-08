/**
 * Shows information about no dashboard defined and allows creating a new,
 * empty one.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { inject as service } from '@ember/service';
import layout from 'onedata-gui-common/templates/components/atm-workflow/charts-dashboard-editor/no-dashboard-info';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  layout,
  classNames: ['no-dashboard-info', 'info-box'],

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.atmWorkflow.chartsDashboardEditor.noDashboardInfo',

  /**
   * @virtual
   * @type {() => void}
   */
  onCreateDashboard: undefined,

  /**
   * @virtual optional
   * @type {boolean}
   */
  isReadOnly: false,
});
