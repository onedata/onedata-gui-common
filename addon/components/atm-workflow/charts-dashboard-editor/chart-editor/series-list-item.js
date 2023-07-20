/**
 * Shows single series information in a form of list item.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { htmlSafe } from '@ember/string';
import _ from 'lodash';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { translateSeriesType } from 'onedata-gui-common/utils/time-series-dashboard';
import {
  ElementType,
  chartElementIcons,
  getUnnamedElementNamePlaceholder,
} from 'onedata-gui-common/utils/atm-workflow/charts-dashboard-editor';
import layout from 'onedata-gui-common/templates/components/atm-workflow/charts-dashboard-editor/chart-editor/series-list-item';

export default Component.extend(I18n, {
  layout,
  classNames: ['series-list-item'],

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.atmWorkflow.chartsDashboardEditor.chartEditor.seriesListItem',

  /**
   * @virtual
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.Series}
   */
  item: undefined,

  /**
   * @type {string}
   */
  icon: chartElementIcons[ElementType.Series],

  /**
   * @type {string}
   */
  seriesGroupIcon: chartElementIcons[ElementType.SeriesGroup],

  /**
   * @type {string}
   */
  axisIcon: chartElementIcons[ElementType.Axis],

  /**
   * @type {ComputedProperty<string | null>}
   */
  name: computed(
    'item.{repeatPerPrefixedTimeSeries,name,prefixedTimeSeriesRef.timeSeriesNameGenerator}',
    function name() {
      if (this.item.repeatPerPrefixedTimeSeries) {
        const timeSeriesNameGenerator =
          this.item.prefixedTimeSeriesRef.timeSeriesNameGenerator;
        return this.t('nameForRepeated', {
          generatorName: timeSeriesNameGenerator ? `${timeSeriesNameGenerator}*` : '?',
        });
      } else {
        return this.item.name ?? null;
      }
    }
  ),

  /**
   * @type {ComputedProperty<SafeString | null>}
   */
  colorStyle: computed(
    'item.{color,repeatPerPrefixedTimeSeries}',
    function colorStyle() {
      return this.item.color && !this.item.repeatPerPrefixedTimeSeries ?
        htmlSafe(`--series-color: ${_.escape(this.item.color)}`) :
        null;
    }
  ),

  /**
   * @type {ComputedProperty<SafeString>}
   */
  typeTranslation: computed('item.type', function typeTranslation() {
    return translateSeriesType(this.i18n, this.item.type);
  }),

  /**
   * @type {ComputedProperty<SafeString>}
   */
  namePlaceholder: computed(function namePlaceholder() {
    return getUnnamedElementNamePlaceholder(this.i18n);
  }),
});
