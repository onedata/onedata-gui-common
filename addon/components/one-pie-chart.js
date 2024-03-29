/**
 * A component that renders a pie chart using series definition from `data`
 * property. Hovered series can be set from the outside by specifying
 * activeSeriesId property.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2017-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/**
 * @typedef {Ember.Object} PieChartSeries A series displayed in a chart
 * @property {string} id An id for the series (must be unique across all
 * chart series).
 * @property {string} label A label for the series.
 * @property {number} value A value to display.
 * @property {string} color A color for series.
 * @property {string} spaceId A id of space, optional.
 */

/* global Chartist */

import Component from '@ember/component';

import { get, computed } from '@ember/object';
import { A } from '@ember/array';
import { debounce } from '@ember/runloop';
import layout from '../templates/components/one-pie-chart';
import _ from 'lodash';
import centeredText from 'onedata-gui-common/utils/chartist/centered-text';
import pieLabels from 'onedata-gui-common/utils/chartist/pie-labels';
import tooltip from 'onedata-gui-common/utils/chartist/tooltip';
import customCss from 'onedata-gui-common/utils/chartist/custom-css';
import legendColors from 'onedata-gui-common/utils/chartist/legend-colors';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import $ from 'jquery';
import dom from 'onedata-gui-common/utils/dom';
import globals from 'onedata-gui-common/utils/globals';

const INACTIVE_SERIES_OPACITY = 0.3;
const SERIES_HOVER_TRANSITION_TIME = 0.3;

export default Component.extend({
  layout,
  classNames: ['one-pie-chart'],
  classNameBindings: [
    '_valuesSum::zero-chart',
    'hideLegend:hide-legend',
    'forceMobile:force-mobile',
  ],

  /**
   * Data for a chart.
   * @type {Ember.Array.PieChartSeries}
   */
  data: null,

  /**
   * If true, data is valid and can be used to generate a chart.
   * @type {computed.boolean}
   */
  isDataValid: computed(() => true),

  /**
   * If true, series will be sorted by value.
   * @type {boolean}
   */
  sort: false,

  /**
   * If true, series sort will be descending.
   * @type {boolean}
   */
  sortDescending: true,

  /**
   * @virtual optional
   * @type {boolean}
   */
  forceMobile: false,

  /**
   * @virtual optional
   * If true, the legend will not be displayed even if in mobile mode
   * @type {boolean}
   */
  hideLegend: false,

  /**
   * Css opacity value of inactive (not hovered) slice.
   * @type {number}
   */
  inactiveOpacity: INACTIVE_SERIES_OPACITY,

  /**
   * Css transition time value for hovered slice animation (in seconds).
   * @type {number}
   */
  hoverTransitionTime: SERIES_HOVER_TRANSITION_TIME,

  /**
   * Id of hovered (active) series.
   * @type {string}
   */
  activeSeriesId: null,

  /**
   * If true, component is displayed using mobile configuration
   * @type {boolean}
   */
  _mobileMode: false,

  mobileMode: computed('_mobileMode', 'forceMobile', function () {
    return this.get('forceMobile') || this.get('_mobileMode');
  }).readOnly(),

  /**
   * Timeout id for styles recompute (see _chartCss property)
   * @type {number}
   */
  _stylesRecomputeTimeoutId: -1,

  /**
   * Window resize handler.
   * @type {Function}
   */
  _windowResizeHandler: computed(function () {
    return () => {
      debounce(this, this._windowResized, 100);
    };
  }),

  /**
   * Sorted data.
   * @type {computed.Ember.Array.PieChartSeries}
   */
  _sortedData: computed('data.[]', 'sort', 'sortDescending', 'isDataValid',
    function () {
      const {
        data,
        sort,
        isDataValid,
      } = this.getProperties('data', 'sort', 'isDataValid');
      if (isDataValid) {
        return sort ? this.sortData(data) : data;
      } else {
        return A();
      }
    }),

  /**
   * All series values sum.
   * @type {computed.number}
   */
  _valuesSum: computed('data.@each.value', function () {
    return this.get('data').reduce((sum, series) => sum + get(series, 'value'), 0);
  }),

  /**
   * Chartist options.
   * @type {computed.Object}
   */
  _chartOptions: computed('_sortedData', '_valuesSum', 'mobileMode', function () {
    return this.generateChartOptions();
  }),

  /**
   * Chartist chart series
   * @type {computed.Array.Object}
   */
  _chartDataSeries: computed('_sortedData.@each.value', '_valuesSum', function () {
    return this.generateChartDataSeries();
  }),

  /**
   * Chartist chart pie labels
   * @type {computed.Array.string}
   */
  _chartPieLabels: computed('_sortedData.@each.label', '_valuesSum', function () {
    return this.generateChartPieLabels();
  }),

  /**
   * Chartist chart css
   * @type {computed.Object}
   */
  _chartCss: computed('_sortedData.[]', 'activeSeriesId', 'inactiveOpacity',
    'hoverTransitionTime', {
      get() {
        const {
          hoverTransitionTime,
          _stylesRecomputeTimeoutId,
        } = this.getProperties(
          'hoverTransitionTime',
          '_stylesRecomputeTimeoutId'
        );
        clearTimeout(_stylesRecomputeTimeoutId);
        this.set('_stylesRecomputeTimeoutId', setTimeout(
          () => {
            if (!this.isDestroyed && !this.isDestroying) {
              this.set('_chartCss', this.generateChartStyles());
            }
          },
          hoverTransitionTime * 1000
        ));
        return this.generateChartStyles();
      },
      set(key, value) {
        return value;
      },
    }
  ),

  /**
   * Chartist data
   * @type {computed.Object}
   */
  _chartData: computed('_chartDataLabels', '_chartDataSeries', '_chartCss',
    '_chartOptions',
    function () {
      return this.generateChartData();
    }
  ),

  didInsertElement() {
    this._super(...arguments);
    const {
      element,
      _windowResizeHandler,
    } = this.getProperties('element', '_windowResizeHandler');

    $(globals.window).on('resize', _windowResizeHandler);
    this._windowResized();
    $(element).mousemove((event) => {
      let parentGroup = event.target.closest('.ct-series');
      if (parentGroup) {
        // extract series id from group class name `slice-id-[series.id]`
        const sliceClass = [...parentGroup.classList].find(
          (c) => c.startsWith('slice-id-')
        );
        const seriesId = sliceClass.substr('slice-id-'.length);
        this.set('activeSeriesId', seriesId);
      } else {
        // if label is hovered, ignore series hover change
        parentGroup = event.target.closest('.ct-pie-label');
        if (!parentGroup) {
          this.set('activeSeriesId', null);
        }
      }
    });
  },

  willDestroyElement() {
    try {
      $(globals.window).off('resize', this.get('_windowResizeHandler'));
    } finally {
      this._super(...arguments);
    }
  },

  /**
   * Sorts data.
   * @param {Ember.Array.PieChartSeries} data The chart data.
   * @returns {Ember.Array.PieChartSeries} A sorted data.
   */
  sortData(data) {
    const sortDescending = this.get('sortDescending');
    const sortedData = A(data.sortBy('value'));
    return sortDescending ? sortedData.reverseObjects() : sortedData;
  },

  /**
   * Returns value as a string.
   * @param {number} value A value.
   * @returns {string} A value string.
   */
  formatValue(value) {
    return String(value);
  },

  /**
   * Options for centered text chartist plugin.
   * @type {Object}
   */
  centeredTextOptions: undefined,

  /**
   * Options for legend colors chartist plugin.
   * @type {Object}
   */
  legendColorsOptions: undefined,

  /**
   * Creates chartist options object.
   * @returns {Object} Chartist options.
   */
  generateChartOptions() {
    let {
      mobileMode,
      _valuesSum,
      _sortedData,
      centeredTextOptions,
      legendColorsOptions,
    } = this.getProperties(
      'mobileMode',
      '_valuesSum',
      '_sortedData',
      'centeredTextOptions',
      'legendColorsOptions'
    );
    if (!centeredTextOptions) {
      centeredTextOptions = this.set('centeredTextOptions', { text: '' });
    }
    if (!legendColorsOptions) {
      legendColorsOptions = this.set('legendColorsOptions', { colors: [] });
    }
    centeredTextOptions.text = this.formatValue(_valuesSum);
    legendColorsOptions.colors = _.map(_sortedData, 'color');
    const optionsBase = {
      donut: true,
      donutWidth: '45%',
      showLabel: false,
      chartPadding: 20,
      plugins: [
        centeredText(centeredTextOptions),
        tooltip({
          chartType: 'pie',
        }),
        pieLabels({
          hideLabelThresholdPercent: 0,
        }),
        customCss(),
        Chartist.plugins.legend({
          legendNames: _.map(_sortedData, 'label'),
          className: 'not-clickable',
          clickable: false,
        }),
        legendColors(legendColorsOptions),
      ],
    };
    if (mobileMode) {
      optionsBase.disabledPlugins = ['pieLabels'];
    } else {
      optionsBase.disabledPlugins = ['tooltip'];
    }
    return optionsBase;
  },

  /**
   * Creates chartist data object.
   * @returns {Object} Chartist data.
   */
  generateChartData() {
    const {
      _chartPieLabels,
      _chartDataSeries,
      _chartCss,
      _sortedData,
    } = this.getProperties(
      '_chartPieLabels',
      '_chartDataSeries',
      '_chartCss',
      '_sortedData'
    );
    return {
      labels: _.map(_sortedData, 'label'),
      pieLabels: _chartPieLabels,
      series: _chartDataSeries,
      customCss: _chartCss,
    };
  },

  /**
   * Creates chartist data series for data object.
   * @returns {Array.Object} Chartist data series.
   */
  generateChartDataSeries() {
    const {
      _sortedData,
      _valuesSum,
    } = this.getProperties('_sortedData', '_valuesSum');
    // If each series == 0 (so _valuesSum == 0), then each series should be drawed
    // using the same value > 0 (here is 1) to give them the same space in chart
    const valuesToDraw = _valuesSum ? _sortedData.mapBy('value') : _sortedData.map(() =>
      1);
    return _sortedData.map((series, index) => {
      return {
        data: valuesToDraw[index],
        className: 'slice-id-' + series.get('id'),
        tooltipElements: [{
          name: 'Value',
          value: this.formatValue(series.get('value')),
        }],
      };
    });
  },

  /**
   * Creates chartist labels for data object.
   * @returns {Array.Object} Chartist labels.
   */
  generateChartPieLabels() {
    const _sortedData = this.get('_sortedData');
    return _sortedData.map((series) => {
      let className = 'label-id-' + series.get('id');
      if (this.getSeriesPercentSize(series) <= 0.15) {
        className += ' label-hidden';
      }
      // This object is not compatible with standard chartist label renderer.
      // It is specific for pie-labels plugin.
      return {
        topText: series.get('label'),
        bottomText: this.formatValue(series.get('value')),
        className,
      };
    });
  },

  /**
   * Creates a styles object for the chart.
   * @returns {Array.Object} Styles specification.
   */
  generateChartStyles() {
    const {
      _sortedData,
      activeSeriesId,
      inactiveOpacity,
      hoverTransitionTime,
    } = this.getProperties(
      '_sortedData',
      'activeSeriesId',
      'inactiveOpacity',
      'hoverTransitionTime'
    );
    return _sortedData.map((series) => {
      // isActive = is nothing or this series hovered
      const isActive = activeSeriesId === series.get('id');
      const isLabelVisible = isActive || (!activeSeriesId &&
        this.getSeriesPercentSize(series) > 0.15);
      // actual values of label opacity and slice stroke-opacity are
      // remembered to save animation state through chart rerender
      return {
        'slice': {
          'stroke': series.get('color') || null,
          'stroke-opacity': this._getSliceOpacity(series),
          'transitionProperties': {
            'transition': `stroke-opacity ${hoverTransitionTime}s`,
            'stroke-opacity': !activeSeriesId || isActive ?
              '1' : String(inactiveOpacity),
          },
        },
        'pie-label': {
          'opacity': this._getLabelOpacity(series),
          'pointer-events': isLabelVisible ? 'initial' : 'none',
          'transitionProperties': {
            transition: `opacity ${hoverTransitionTime}s`,
            opacity: isLabelVisible ? '1' : '0',
          },
        },
      };
    });
  },

  /**
   * Returns series share in overall values sum.
   * @param {PieChartSeries} series A series.
   * @returns {number} A value 0 < x <= 1
   */
  getSeriesPercentSize(series) {
    const {
      _valuesSum,
      _sortedData,
    } = this.getProperties('_valuesSum', '_sortedData');
    return _valuesSum ? series.get('value') / this.get('_valuesSum') :
      1 / _sortedData.get('length');
  },

  /**
   * Returns actual series slice opacity.
   * @param {PieChartSeries} series A series.
   * @returns {string} stroke-opacity value
   */
  _getSliceOpacity(series) {
    const slicePath = this.element?.querySelector(`.slice-id-${series.get('id')} path`);
    return slicePath ? dom.getStyle(slicePath, 'stroke-opacity') : '';
  },

  /**
   * Returns actual series label opacity.
   * @param {PieChartSeries} series A series.
   * @returns {string} opacity value
   */
  _getLabelOpacity(series) {
    const label = this.element?.querySelector('.label-id-' + series.get('id'));
    return label ? dom.getStyle(label, 'opacity') : '';
  },

  /**
   * Checks if the browser window has mobile width or not
   */
  _windowResized() {
    safeExec(this, 'set', '_mobileMode', globals.window.innerWidth < 768);
  },
});
