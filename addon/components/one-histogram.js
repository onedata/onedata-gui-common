import Component from '@ember/component';
import { computed } from '@ember/object';
import layout from '../templates/components/one-histogram';
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';
import stringifyDuration from 'onedata-gui-common/utils/i18n/stringify-duration';

export default Component.extend(createDataProxyMixin('state'), {
  layout,
  classNames: ['one-histogram'],

  /**
   * @virtual
   * @type {Utils.OneHistogram.Configuration}
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
      console.log(state.asEchartState());
      return state.asEchartState();
    }
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
    return this.get('configuration').getNewestState();
  },

  onStateChange() {
    this.updateStateProxy({ replace: true });
  },

  actions: {
    changeTimeResolution(timeResolution) {
      this.set('selectedTimeResolution', timeResolution);
      this.get('configuration').setViewParameters({
        timeResolution,
      });
    },
  },
});
