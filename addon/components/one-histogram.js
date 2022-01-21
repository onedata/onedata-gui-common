import Component from '@ember/component';
import { computed, getProperties } from '@ember/object';
import { reads } from '@ember/object/computed';
import layout from '../templates/components/one-histogram';
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';
import stringifyDuration from 'onedata-gui-common/utils/i18n/stringify-duration';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, createDataProxyMixin('state'), {
  layout,
  classNames: ['one-histogram'],
  classNameBindings: ['hasDataToShow::no-data'],

  /**
   * @override
   */
  i18nPrefix: 'components.oneHistogram',

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
    return this.get('configuration').getNewestState();
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
