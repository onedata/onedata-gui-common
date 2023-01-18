/**
 * A component that renders providers support for specified space.
 *
 * @module components/space-providers-support-chart
 * @author Michal Borzecki
 * @copyright (C) 2017-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject, {
  getProperties,
  get,
  computed,
} from '@ember/object';

import { A, isArray } from '@ember/array';
import _ from 'lodash';
import bytesToString from 'onedata-gui-common/utils/bytes-to-string';
import OnePieChart from 'onedata-gui-common/components/one-pie-chart';
import { reads, and } from '@ember/object/computed';
import { inject as service } from '@ember/service';

export default OnePieChart.extend({
  classNames: ['space-providers-support-chart'],
  i18n: service(),

  /**
   * Space.
   * To inject.
   * @type {Space}
   */
  space: null,

  /**
   * Object with mapping providerId -> color. To refresh computed properties,
   * reference must change.
   * To inject.
   * @type {Object}
   */
  providersColors: Object.freeze({}),

  /**
   * @virtual
   * @type {PromiseArray<models/Provider>}
   */
  providers: reads('space.providerList.list.content'),

  providersProxyLoaded: and(
    'space.providerList.isLoaded',
    'space.providerList.list.isFulfilled'
  ),

  /**
   * Data for OnePieChart
   * @type {computed.Ember.Array.PieChartSeries}
   */
  data: computed(
    'space.supportSizes',
    'providersColors',
    'providers.@each.{entityId,name}',
    'providersProxyLoaded',
    function getData() {
      if (this.get('providersProxyLoaded')) {
        const {
          space,
          providersColors,
        } = this.getProperties('space', 'providersColors');
        const supportSizes = get(space, 'supportSizes');
        const providers = this.providers?.toArray() || [];
        return A(providers
          .filter(p => get(supportSizes, get(p, 'entityId')))
          .map(provider => {
            const providerId = get(provider, 'entityId');
            return EmberObject.create({
              id: String(providerId),
              label: get(provider, 'name'),
              value: get(supportSizes, providerId),
              color: get(providersColors, providerId),
            });
          })
        );
      } else {
        return A();
      }
    }),

  /**
   * If true, space object is valid and can be used as a data source for a chart.
   * @type {computed.boolean}
   */
  isDataValid: computed(
    'space.{totalSize,supportSizes}',
    'providers.@each.entityId',
    'providersProxyLoaded',
    function () {
      if (this.get('providersProxyLoaded')) {
        const space = this.get('space');
        if (!space) {
          return false;
        }
        const {
          totalSize,
          supportSizes,
        } = getProperties(space, 'totalSize', 'supportSizes');
        const providers = this.get('providers');

        if (
          typeof totalSize !== 'number' ||
          totalSize < 0 ||
          !supportSizes ||
          !isArray(providers)
        ) {
          return false;
        }

        let realTotalSize = 0;
        let errorOccurred = false;
        _.each(Object.keys(supportSizes), (providerId) => {
          const size = get(supportSizes, providerId);
          const provider = _.find(
            providers.toArray(),
            p => get(p, 'entityId') === providerId
          );
          if (typeof size !== 'number' || size <= 0 || !provider) {
            errorOccurred = true;
          } else {
            realTotalSize += size;
          }
        });
        return !errorOccurred && realTotalSize === totalSize;
      } else {
        return undefined;
      }
    }
  ),

  /**
   * @override
   */
  generateChartDataSeries() {
    const {
      _sortedData,
      i18n,
    } = this.getProperties('_sortedData', 'i18n');
    const chartDataSeries = this._super(...arguments);
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
   * @returns {string} A size string representation.
   */
  formatValue(value) {
    return bytesToString(value, { iecFormat: true });
  },
});
