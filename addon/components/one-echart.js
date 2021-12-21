/**
 * Renders chart using Apache ECharts library.
 * More about that library: https://echarts.apache.org/
 *
 * @module components/one-echart
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
   * @type {ComputedProperty<PromiseObject<ECharts>>}
   */
  echartsLibraryProxy: computed(function echartsLibraryProxy() {
    return this.get('librariesLoader').loadLibrary('echarts');
  }),

  optionApplyer: observer('option', function optionsApplyer() {
    this.applyChartOption();
  }),

  /**
   * @override
   */
  didInsertElement() {
    this._super(...arguments);
    this.get('echartsLibraryProxy').then(() => this.setupChart());
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
    const echarts = this.get('echartsLibraryProxy.content');
    if (!element || !echarts || existingChart) {
      return existingChart || null;
    }

    this.set('chart', echarts.init(element.querySelector('.chart')));
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
