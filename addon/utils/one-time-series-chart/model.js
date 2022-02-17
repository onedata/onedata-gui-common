/**
 * A class, that contains both configuration and the latest state of
 * one-time-series-chart. It allows to fully control and get information
 * about specific chart.
 *
 * @module utils/one-time-series-chart/model
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject, { computed } from '@ember/object';
import _ from 'lodash';
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';

export default EmberObject.extend(createDataProxyMixin('state'), {
  /**
   * @virtual
   * @public
   * @readonly
   * @type {Utils.OneTimeSeriesChart.Configuration}
   */
  configuration: undefined,

  /**
   * Latest view parameters taken from configuration -
   * `configuration.getViewParameters()`. Exposed as a dedicated property
   * to allow reactivity.
   * @public
   * @readonly writable only from inside
   * @type {OTSCViewParameters}
   */
  lastViewParameters: undefined,

  /**
   * @private
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

    configuration.registerStateChangeHandler(stateChangeHandler);
    this.updateLastViewParameters();
  },

  /**
   * @override
   */
  willDestroy() {
    try {
      const {
        configuration,
        stateChangeHandler,
      } = this.getProperties('configuration', 'stateChangeHandler');
      configuration.deregisterStateChangeHandler(stateChangeHandler);
      configuration.destroy();
    } finally {
      this._super(...arguments);
    }
  },

  /**
   * @public
   * @param {Partial<OTSCViewParameters>} viewParameters
   * @returns {void}
   */
  setViewParameters(viewParameters) {
    this.get('configuration').setViewParameters(viewParameters);
  },

  /**
   * @override
   */
  fetchState() {
    return this.get('configuration').getState();
  },

  /**
   * @private
   */
  onStateChange() {
    this.updateLastViewParameters();
    this.updateStateProxy({ replace: true });
  },

  /**
   * @private
   */
  updateLastViewParameters() {
    const {
      lastViewParameters,
      configuration,
    } = this.getProperties('lastViewParameters', 'configuration');

    const newLastViewParameters = configuration.getViewParameters();
    if (!_.isEqual(lastViewParameters, newLastViewParameters)) {
      this.set('lastViewParameters', newLastViewParameters);
    }
  },
});
