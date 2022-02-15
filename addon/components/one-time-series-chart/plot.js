/**
 * Is responsible for plotting chart in one-time-series-chart. Can be used via
 * one-time-series-chart or as a standalone component. The second option requires
 * providing `model` object - see more about it in
 * `Utils.OneTimeSeriesChart.Model` class.
 *
 * @module components/one-time-series-chart/plot
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed, getProperties } from '@ember/object';
import { reads } from '@ember/object/computed';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import layout from '../../templates/components/one-time-series-chart/plot';

export default Component.extend(I18n, {
  layout,
  classNames: ['one-time-series-chart-plot'],
  classNameBindings: ['hasDataToShow::no-data'],

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.oneTimeSeriesChart.plot',

  /**
   * @virtual
   * @type {Utils.OneTimeSeriesChart.Model}
   */
  model: undefined,

  /**
   * @type {ComputedProperty<PromiseObject<Utils.OneTimeSeriesChart.State>>}
   */
  stateProxy: reads('model.stateProxy'),

  /**
   * @type {ComputedProperty<Utils.OneTimeSeriesChart.State>}
   */
  state: reads('model.state'),

  /**
   * @type {ComputedProperty<ECOption>}
   */
  echartState: computed('state', function echartState() {
    const state = this.get('state');
    if (state) {
      return state.asEchartState();
    }
  }),

  /**
   * @type {ComputedProperty<string>}
   */
  title: reads('state.title'),

  /**
   * @type {ComputedProperty<boolean>}
   */
  hasDataToShow: computed(
    'stateProxy.{content.isPending}',
    function hasDataToShow() {
      const stateProxy = this.get('stateProxy');
      if (!stateProxy) {
        return false;
      }

      const {
        content: state,
        isPending,
      } = getProperties(stateProxy, 'content', 'isPending');

      return isPending || (
        state &&
        state.timeResolution &&
        state.yAxes.length &&
        state.series.length
      );
    }
  ),
});
