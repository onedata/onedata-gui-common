/**
 * Shows single series group information in a form of list item.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import {
  ElementType,
  chartElementIcons,
  getUnnamedElementNamePlaceholder,
} from 'onedata-gui-common/utils/atm-workflow/chart-dashboard-editor';
import layout from 'onedata-gui-common/templates/components/atm-workflow/chart-dashboard-editor/chart-editor/series-groups-list-item';

export default Component.extend(I18n, {
  layout,
  classNames: ['series-groups-list-item'],

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.atmWorkflow.chartDashboardEditor.chartEditor.seriesGroupsListItem',

  /**
   * @virtual
   * @type {Utils.AtmWorkflow.ChartDashboardEditor.SeriesGroup}
   */
  item: undefined,

  /**
   * @type {string}
   */
  icon: chartElementIcons[ElementType.SeriesGroup],

  /**
   * @type {string}
   */
  seriesIcon: chartElementIcons[ElementType.Series],

  /**
   * @type {ComputedProperty<SafeString>}
   */
  namePlaceholder: computed(function namePlaceholder() {
    return getUnnamedElementNamePlaceholder(this.i18n);
  }),
});
