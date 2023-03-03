/**
 * Renders time series chart according to settings passed via `configuration`.
 *
 * Configuration object should neither be replaced, nor used by another chart in
 * the same time. Options of visible data can be adjusted by altering
 * values in `configuration` (also from outside of this component).
 * For more information about configuration options see
 * `Utils.OneTimeSeriesChart.Configuration` class.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import layout from '../templates/components/one-time-series-chart';
import Model from 'onedata-gui-common/utils/one-time-series-chart/model';

export default Component.extend({
  layout,
  classNames: ['one-time-series-chart'],

  /**
   * @virtual
   * @type {Utils.OneTimeSeriesChart.Configuration}
   */
  configuration: undefined,

  /**
   * @type {ComputedProperty<Utils.OneTimeSeriesChart.Model>}
   */
  model: computed('configuration', function model() {
    return Model.create({ configuration: this.get('configuration') });
  }),

  /**
   * @override
   */
  willDestroyElement() {
    try {
      this.get('model').destroy();
    } finally {
      this._super(...arguments);
    }
  },
});
