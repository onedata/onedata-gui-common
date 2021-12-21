import Component from '@ember/component';
import { observer } from '@ember/object';
import WindowResizeHandler from 'onedata-gui-common/mixins/components/window-resize-handler';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';

export default Component.extend(WindowResizeHandler, {
  classNames: ['one-echart'],

  /**
   * @virtual
   * @type {ECOption}
   */
  option: undefined,

  /**
   * @override
   */
  callWindowResizeHandlerOnInsert: false,

  /**
   * @type {ECharts}
   */
  chart: undefined,

  optionApplyer: observer('option', function optionsApplyer() {
    this.applyChartOption();
  }),

  /**
   * @override
   */
  didInsertElement() {
    this._super(...arguments);

    this.setupChart();
  },

  /**
   * @override
   */
  willDestroyElement() {
    try {
      this.destroyChart();
    } finally {
      this._super(...arguments);
    }
  },

  /**
   * @override
   */
  onWindowResize() {
    safeExec(this, () => {
      this.resizeChart();
    });
  },

  setupChart() {
    const {
      element,
      chart: existingChart,
    } = this.getProperties('element', 'chart');
    if (!element || existingChart) {
      return existingChart || null;
    }

    this.set('chart', window.echarts.init(element));
    this.applyChartOption();
  },

  applyChartOption() {
    const {
      chart,
      option,
    } = this.getProperties('chart', 'option');
    if (chart && option) {
      chart.setOption(option);
    }
  },

  resizeChart() {
    const chart = this.get('chart');
    if (chart) {
      chart.resize();
    }
  },

  destroyChart() {
    const chart = this.get('chart');
    if (chart) {
      chart.dispose();
    }
  },
});
