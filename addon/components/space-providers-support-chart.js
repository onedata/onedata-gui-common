/**
 * A component that renders providers support for specified space.
 * 
 * @module components/space-providers-support-chart
 * @author Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject, {
  getProperties,
  get,
  computed
} from '@ember/object';

import { A, isArray } from '@ember/array';
import _ from 'lodash';
import bytesToString from 'onedata-gui-common/utils/bytes-to-string';
import OnePieChart from 'onedata-gui-common/components/one-pie-chart';
import { reads, and } from '@ember/object/computed';

export default OnePieChart.extend({
  classNames: ['space-providers-support-chart'],

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
    'providers.@each.entityId',
    'providersProxyLoaded',
    function getData() {
      if (this.get('providersProxyLoaded')) {
        let {
          space,
          providersColors,
        } = this.getProperties('space', 'providersColors');
        let supportSizes = get(space, 'supportSizes');
        const providers = this.get('providers');
        return A(
          _.map(Object.keys(supportSizes), providerId => {
            const provider = _.find(
              providers.toArray(),
              p => get(p, 'entityId') === providerId
            );
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
        let space = this.get('space');
        if (!space) {
          return false;
        }
        let {
          totalSize,
          supportSizes,
        } = getProperties(space, 'totalSize', 'supportSizes');
        const providers = this.get('providers')

        if (typeof totalSize !== 'number' || totalSize < 0 ||
          !supportSizes || !isArray(providers)) {
          return false;
        }

        let realTotalSize = 0;
        let errorOccurred = false;
        _.each(Object.keys(supportSizes), (providerId) => {
          let size = get(supportSizes, providerId);
          let provider = _.find(
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
   * Returns size as a string.
   * @param {number} value A size.
   * @return {string} A size string representation.
   */
  formatValue(value) {
    return bytesToString(value, { iecFormat: true });
  },
});
