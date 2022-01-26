/**
 * Renders time series chart according to settings passed via `configuration`.
 * Uses `one-echart` component to render chart visualisation.
 *
 * Configuration object should neither be replaced, nor used by another chart in
 * the same time. Options of visible data can be adjusted by altering
 * values in `configuration` (also from outside of this component).
 * For more information about configuration options see
 * `Utils.OneTimeSeriesChart.Configuration` class.
 *
 * @module components/one-time-series-chart
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed, getProperties } from '@ember/object';
import { reads } from '@ember/object/computed';
import layout from '../templates/components/one-time-series-chart';
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';
import stringifyDuration from 'onedata-gui-common/utils/i18n/stringify-duration';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';

export default Component.extend(I18n, createDataProxyMixin('state'), {
  layout,
  classNames: ['one-time-series-chart'],
  classNameBindings: ['hasDataToShow::no-data'],

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.oneTimeSeriesChart',

  /**
   * @virtual
   * @type {Utils.OneTimeSeriesChart.Configuration}
   */
  configuration: undefined,

  /**
   * @type {number}
   */
  selectedTimeResolution: undefined,

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
   * @type {ComputedProperty<boolean>}
   */
  hasDataToShow: computed('stateProxy.{content.isPending}', function hasDataToShow() {
    const stateProxy = this.get('stateProxy');
    const {
      content: state,
      isPending,
    } = getProperties(stateProxy, 'content', 'isPending');
    return isPending || (state && state.timeResolution && state.yAxes.length && state.series.length);
  }),

  /**
   * @type {ComputedProperty<Array<FieldOption>>}
   */
  timeResolutionOptions: computed(
    'configuration.timeResolutionSpecs',
    function readableTimeResolutions() {
      const timeResolutionSpecs = this.get('configuration.timeResolutionSpecs') || [];
      return timeResolutionSpecs.map(({ timeResolution }) => ({
        value: timeResolution,
        label: stringifyDuration(timeResolution, {
          shortFormat: true,
          showIndividualSeconds: true,
        }),
      }));
    }
  ),

  /**
   * @type {ComputedProperty<boolean>}
   */
  isShowOlderDisabled: reads('state.hasReachedOldest'),

  /**
   * @type {ComputedProperty<boolean>}
   */
  isShowNewerAndNewestDisabled: reads('state.hasReachedNewest'),

  /**
   * @type {ComputedProperty<() => void>}
   */
  stateChangeHandler: computed(function stateChangeHandler() {
    return () => this.onStateChange();
  }),

  /**
   * @override
   */
  init() {
    this._super(...arguments);
    const {
      configuration,
      stateChangeHandler,
    } = this.getProperties('configuration', 'stateChangeHandler');
    this.set('selectedTimeResolution', configuration.timeResolution);
    configuration.registerStateChangeHandler(stateChangeHandler);
  },

  /**
   * @override
   */
  willDestroyElement() {
    try {
      const {
        configuration,
        stateChangeHandler,
      } = this.getProperties('configuration', 'stateChangeHandler');
      configuration.deregisterStateChangeHandler(stateChangeHandler);
    } finally {
      this._super(...arguments);
    }
  },

  /**
   * @override
   */
  fetchState() {
    return this.get('configuration').getState();
  },

  onStateChange() {
    const {
      configuration,
      selectedTimeResolution,
    } = this.getProperties('configuration', 'selectedTimeResolution');
    const timeResolutionInConfig = configuration.getViewParameters().timeResolution;
    if (selectedTimeResolution !== timeResolutionInConfig) {
      this.set('selectedTimeResolution', timeResolutionInConfig);
    }
    this.updateStateProxy({ replace: true });
  },

  actions: {
    changeTimeResolution(timeResolution) {
      this.set('selectedTimeResolution', timeResolution);
      this.get('configuration').setViewParameters({
        timeResolution,
      });
    },
    showOlder() {
      const {
        configuration,
        state,
      } = this.getProperties('configuration', 'state');
      configuration.setViewParameters({
        lastWindowTimestamp: state.firstWindowTimestamp - state.timeResolution,
      });
    },
    showNewer() {
      const {
        configuration,
        state,
      } = this.getProperties('configuration', 'state');
      configuration.setViewParameters({
        lastWindowTimestamp: state.lastWindowTimestamp + state.timeResolution * state.windowsCount,
      });
    },
    showNewest() {
      this.get('configuration').setViewParameters({
        lastWindowTimestamp: null,
      });
    },
  },
});
