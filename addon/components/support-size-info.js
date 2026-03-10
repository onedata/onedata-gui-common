/**
 * A component that shows information about support size using table and chart.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2017-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/**
 * @typedef {Ember.Object} SupportSizeEntry An entry with support size info
 * @property {string} supporterName A supporter name.
 * @property {number} supportSize A support size (in bytes).
 * @property {string} supporterId A supporter id.
 */

import Component from '@ember/component';

import EmberObject, { computed } from '@ember/object';
import { A } from '@ember/array';
import _ from 'lodash';
import layout from 'onedata-gui-common/templates/components/support-size-info';
import I18n from 'onedata-gui-common/mixins/i18n';
import addConflictLabels from 'onedata-gui-common/utils/add-conflict-labels';
import { getNameWithConflictLabel } from 'onedata-gui-common/components/name-conflict';

export default Component.extend(I18n, {
  layout,
  classNames: ['support-size-info'],

  /** @override */
  i18nPrefix: 'components.supportSizeInfo',

  /**
   * Data to display.
   * To inject.
   * @type Ember.Array.PieChartSeries
   */
  data: null,

  /**
   * Header text.
   * To inject.
   * @type {string}
   */
  header: '',

  /**
   * Defines the maximum number of spaces displayed in the chart view.
   * If the number of spaces exceeds this limit, only the table version is displayed.
   * @type {number}
   */
  chartMaxSpaces: 18,

  /**
   * Tip for header in `chart` mode.
   * @type {string}
   */
  chartHeaderTip: '',

  /**
   * Tip for header in `table` mode.
   * @type {string}
   */
  tableHeaderTip: '',

  /**
   * Title for supporter name table column.
   * To inject.
   * @type {string}
   */
  supporterNameHeader: '',

  /**
   * Type of record in first column
   * @virtual optional
   * @type {'space'|'provider'}
   */
  type: '',

  /**
   * Message, that is shown when there is no data
   * @type {string}
   */
  noDataToShowMessage: '',

  /**
   * Component mode. `chart` or `table`
   * @type {string}
   */
  mode: 'chart',

  /**
   * @type {string}
   */
  searchString: '',

  /**
   * @type {boolean}
   */
  disabledChartMode: computed(
    'data.length',
    'chartMaxSpaces',
    function disabledChartMode() {
      return this.data.length > this.chartMaxSpaces;
    }
  ),

  /**
   * If true, header tip is visible.
   * @type {boolean}
   */
  _tipVisible: computed('mode', 'chartHeaderTip', 'tableHeaderTip', function () {
    const {
      mode,
      chartHeaderTip,
      tableHeaderTip,
    } = this.getProperties('mode', 'chartHeaderTip', 'tableHeaderTip');
    return mode === 'chart' ? !!chartHeaderTip : !!tableHeaderTip;
  }),

  /**
   * Data for a table
   * @type {computed.Ember.Array.SupportSizeEntry}
   */
  supportTableData: computed('data', function () {
    const data = this.get('data');
    return A(data.map((series) => EmberObject.create({
      supporterName: series.get('label'),
      supportSize: series.get('value'),
      supporterId: series.get('spaceId') || series.get('providerId'),
    })));
  }),

  /**
   * Filtered support table data based on search string.
   * @type {computed.Ember.Array.SupportSizeEntry}
   */
  filteredSupportTableData: computed(
    'supportTableData',
    'searchString',
    function filteredSupportTableData() {
      const supportTableData = this.supportTableData;
      const searchString = this.searchString;
      addConflictLabels(supportTableData, 'supporterName', 'supporterId');
      if (!searchString) {
        return supportTableData;
      }
      return supportTableData.filter((entry) => {
        const searchableName = getNameWithConflictLabel(
          entry.supporterName,
          entry.conflictLabel
        );
        return searchableName.toLowerCase().includes(searchString.toLowerCase());
      });
    }
  ),

  /**
   * Total size
   * @type {computed.Number}
   */
  totalSize: computed('data.@each.value', function () {
    const data = this.get('data');
    if (data.length === 0) {
      return 0;
    }
    return _.sum(data.map((series) => series.get('value')));
  }),

  init() {
    this._super(...arguments);
    if (this.disabledChartMode) {
      this.set('mode', 'table');
    }
  },

  actions: {
    modeChanged(mode) {
      this.set('mode', mode);
    },
  },
});
