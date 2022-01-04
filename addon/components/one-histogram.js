import Component from '@ember/component';
import { computed } from '@ember/object';
import layout from '../templates/components/one-histogram';
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';

export default Component.extend(createDataProxyMixin('state'), {
  layout,
  classNames: ['one-histogram'],

  /**
   * @virtual
   * @type {Utils.OneHistogram.Configuration}
   */
  configuration: undefined,

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
   * @override
   */
  fetchState() {
    return this.get('configuration').getNewestState();
  },
});
