/**
 * A component that renders spaces supported by specified provider.
 * 
 * @module components/provider-spaces-support-chart
 * @author Michal Borzecki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import OnePieChart from 'onedata-gui-common/components/one-pie-chart';
import { inject as service } from '@ember/service';
import EmberObject, { computed, observer, get } from '@ember/object';
import generateColors from 'onedata-gui-common/utils/generate-colors';
import bytesToString from 'onedata-gui-common/utils/bytes-to-string';
import { A } from '@ember/array';

export default OnePieChart.extend({
  classNames: ['provider-spaces-support-chart'],
  i18n: service(),
  guiUtils: service(),

  /**
   * @virtual
   * @type {string}
   */
  providerId: undefined,

  /**
   * @virtual
   * @type {PromiseArray<Spaces>}
   */
  spaces: undefined,

  /**
   * Name of the space field, that contains info about providers support.
   * Used to deal with different API of applications
   * @type {string}
   */
  supportInfoFieldName: 'supportSizes',

  /**
   * Set by dataObserver
   * @type {Ember.ComputedProperty<Array<PieChartSeries>>}
   */
  data: Object.freeze([]),

  /**
   * Mapping spaceId -> color
   * @type {Ember.ComputedProperty<Object>}
   */
  spacesColors: computed('spaces.[]', function spacesColors() {
    const spaces = this.get('spaces');
    if (get(spaces, 'isFulfilled')) {
      const colors = generateColors(get(spaces, 'length'));
      return spaces.reduce((colorsMap, space, index) => {
        colorsMap[get(space, 'id')] = colors[index];
        return colorsMap;
      }, {});
    } else {
      return {};
    }
  }),

  dataObserver: observer('supportInfoFieldName', function dataObserver() {
    const supportInfoFieldName = this.get('supportInfoFieldName');
    this.set('data', computed(
      'providerId',
      'spacesColors',
      `spaces.@each.{${supportInfoFieldName},name}`,
      function data() {
        const {
          providerId,
          spaces,
          spacesColors,
          supportInfoFieldName,
        } = this.getProperties(
          'providerId',
          'spaces',
          'spacesColors',
          'supportInfoFieldName'
        );
        if (get(spaces, 'isFulfilled')) {
          return A(spaces.map(space => {
            const spaceId = get(space, 'id');
            return EmberObject.create({
              id: spaceId,
              label: get(space, 'name'),
              value: get(space, supportInfoFieldName)[providerId],
              color: spacesColors[spaceId],
            });
          }));
        } else {
          return [];
        }
      }
    ));
  }),

  init() {
    this._super(...arguments);
    this.dataObserver();
  },

  /**
   * @override
   */
  generateChartDataSeries() {
    const {
      _sortedData,
      i18n,
    } = this.getProperties('_sortedData', 'i18n');
    let chartDataSeries = this._super(...arguments);
    chartDataSeries.forEach((series, index) => {
      series.tooltipElements = [{
        name: i18n.t('components.supportSizeInfo.chart.supportSize'),
        value: this.formatValue(_sortedData[index].value),
      }, {
        name: i18n.t('components.supportSizeInfo.chart.supportShare'),
        value: Math.round(
          this.getSeriesPercentSize(_sortedData[index]) * 100
        ) + '%',
      }];
    });
    return chartDataSeries;
  },

  /**
   * Returns size as a string.
   * @param {number} value A size.
   * @return {string} A size string representation.
   */
  formatValue(value) {
    return bytesToString(value, { iecFormat: true });
  },
});
