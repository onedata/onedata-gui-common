/**
 * Is responsible for plotting chart in one-time-series-chart. Can be used via
 * one-time-series-chart or as a standalone component. If you wish to use it
 * as standalone component, provide a model object - see more about it in
 * `Utils.OneTimeSeriesChart.Model` class.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed, getProperties } from '@ember/object';
import { reads } from '@ember/object/computed';
import { htmlSafe } from '@ember/string';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import layout from '../../templates/components/one-time-series-chart/plot';
import escapeHtml from 'onedata-gui-common/utils/one-time-series-chart/escape-html';

export default Component.extend(I18n, {
  layout,
  classNames: ['one-time-series-chart-plot'],
  classNameBindings: [
    'hasDataToShow::no-data',
    'isEchartsTooltipFixed:echarts-tooltip-fixed',
  ],

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
   * If true, then echarts tooltip stops floating and can be entered by mouse.
   * @type {boolean}
   */
  isEchartsTooltipFixed: false,

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
  title: reads('state.title.content'),

  /**
   * @type {ComputedProperty<string>}
   */
  titleTip: computed('state.title.tip', function titleTip() {
    const escapedTip = escapeHtml(this.get('state.title.tip'));
    return escapedTip ? htmlSafe(escapedTip) : null;
  }),

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

  attachEventHandlersToChart(chart) {
    this.set('isEchartsTooltipFixed', false);
    const hideTooltip = () => {
      this.set('isEchartsTooltipFixed', false);
      // Using `hideTip` doesn't hide hover lines.
      chart.dispatchAction({
        type: 'showTip',
        x: -1,
        y: -1,
      });
      chart.setOption({
        tooltip: {
          enterable: false,
        },
      });
    };
    const tooltipNode = this.element.querySelector('.chart-tooltip');
    const isTooltipVisuallyHidden = () =>
      !tooltipNode?.getAttribute('style') ||
      tooltipNode.style.opacity === '0';

    chart.getZr().on('mousemove', (event) => {
      if (!this.isEchartsTooltipFixed) {
        chart.dispatchAction({
          type: 'showTip',
          x: event.offsetX,
          y: event.offsetY,
        });
      }
    });

    chart.getZr().on('click', (event) => {
      chart.setOption({
        tooltip: {
          enterable: true,
        },
      });
      chart.dispatchAction({
        type: 'showTip',
        x: event.offsetX,
        y: event.offsetY,
      });
      if (isTooltipVisuallyHidden()) {
        hideTooltip();
      } else {
        this.set('isEchartsTooltipFixed', true);
      }
    });

    chart.on('globalout', () => {
      hideTooltip();
    });

    if (tooltipNode) {
      const tooltipMutationObserver = new MutationObserver(() => {
        // There is no event, which would tell us, that tooltip was closed.
        // In order to detect that situation we are forced to monitor changes
        // on the tooltip node directly.
        if (this.isEchartsTooltipFixed && isTooltipVisuallyHidden()) {
          hideTooltip();
        }
      });
      tooltipMutationObserver.observe(tooltipNode, {
        attributes: true,
        attributeFilter: ['style'],
      });
    }
  },

  actions: {
    registerApi(chart) {
      this.attachEventHandlersToChart(chart);
    },
  },
});
