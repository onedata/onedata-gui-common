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
import { translateSeriesType } from 'onedata-gui-common/utils/time-series-dashboard';
import layout from 'onedata-gui-common/templates/components/atm-workflow/charts-dashboard-editor/chart-editor/series-list-item';

export default Component.extend({
  layout,
  classNames: ['series-list-item'],

  i18n: service(),

  /**
   * @virtual
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.Series}
   */
  item: undefined,

  /**
   * @type {ComputedProperty<SafeString | null>}
   */
  colorStyle: computed('item.color', function colorStyle() {
    return this.item.color ?
      htmlSafe(`--series-color: ${_.escape(this.item.color)}`) :
      null;
  }),

  /**
   * @type {ComputedProperty<SafeString>}
   */
  typeTranslation: computed('item.type', function typeTranslation() {
    return translateSeriesType(this.i18n, this.item.type);
  }),
});
