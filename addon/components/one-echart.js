/**
 * Renders chart using Apache ECharts library.
 * More about that library: https://echarts.apache.org/
 *
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from '../templates/components/one-echart';
import { observer, computed } from '@ember/object';
import WindowResizeHandler from 'onedata-gui-common/mixins/components/window-resize-handler';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import { inject as service } from '@ember/service';
import { next } from '@ember/runloop';
import globals from 'onedata-gui-common/utils/globals';

/**
 * @typedef {Object} ECOption An object, that is passed to `setOption` Echarts
 * instance method. For more information, see:
 * https://github.com/apache/echarts/blob/master/src/util/types.ts
 */

export default Component.extend(WindowResizeHandler, {
  layout,
  classNames: ['one-echart'],

  librariesLoader: service(),

  /**
   * Options, which defines the look and input data of a chart.
   * Note: `'option'` without ending `'s'` is not a typo. ECharts API
   * mentions `'option'` as a parameter containing all settings. This component
   * tries to provide similar API, hence usage of `'option'`.
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

  /**
   * Binded version of `persistRawDataInCanvas` method. Needed for
   * (de)registering event handlers.
   * @type {() => void}
   */
  persistRawDataInCanvasFunction: undefined,

  /**
   * @type {ComputedProperty<PromiseObject<ECharts>>}
   */
  echartsLibraryProxy: computed(function echartsLibraryProxy() {
    return this.get('librariesLoader').loadLibrary('echarts');
  }),

  optionApplyer: observer('option', function optionApplyer() {
    this.applyChartOption();
  }),

  /**
   * @override
   */
  init() {
    this._super(...arguments);
    this.set('persistRawDataInCanvasFunction', this.persistRawDataInCanvas.bind(this));
  },

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

  async setupChart() {
    const echarts = await this.echartsLibraryProxy;
    next(() => globals.window.requestAnimationFrame(() => safeExec(this, () => {
      if (!this.element || !echarts || this.chart) {
        return;
      }

      const chart = echarts.init(this.element.querySelector('.chart'));
      chart.on('rendered', this.persistRawDataInCanvasFunction);
      this.set('chart', chart);
      this.applyChartOption();
    })));
  },

  applyChartOption() {
    if (this.chart && this.option) {
      this.chart.setOption(this.option, { replaceMerge: ['series'] });
    }
  },

  resizeChart() {
    const chart = this.get('chart');
    if (chart) {
      chart.resize();
    }
  },

  destroyChart() {
    if (this.chart) {
      this.chart.off('rendered', this.persistRawDataInCanvasFunction);
      this.chart.dispose();
    }
  },

  /**
   * Extracts raw chart data (points, series name, etc.) from Echart instance
   * and assigns it as JSON to canvas attribute. It allows to test rendered
   * data without guessing from canvas pixels.
   * @returns {void}
   */
  persistRawDataInCanvas() {
    // Setting raw data works only for data specified inside each series (via
    // `data` property). More advanced data-defining approaches (like via
    // `dataset`) are not supported.

    const canvas = this.element?.querySelector('canvas');
    if (!canvas || !this.chart) {
      return;
    }

    const echartSeriesArray = this.chart.getOption().series;
    canvas.__onedata__ = {
      // We need to apply filter, because when one of series is going to
      // disappear, then for a moment it becomes `null` before a real removal.
      series: echartSeriesArray.filter(Boolean).map(({ name, type, data = [] }) => ({
        name,
        type,
        data: data.map((entry) => {
          if (Array.isArray(entry)) {
            // (x, y) coordinates. We need to use `Number()` because
            // it'll be a very common case that the first element will be
            // a stringified timestamp (from one-time-series-chart).
            const x = String(Number(entry[0])) === entry[0] ? Number(entry[0]) : entry[0];
            const y = entry[1];
            return [x, y];
          } else {
            // Some custom point format - return as is.
            return entry;
          }
        }),
      })),
    };
  },
});
