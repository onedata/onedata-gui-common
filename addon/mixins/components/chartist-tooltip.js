/**
 * Adds tooltip to chart.
 *
 * To enable, addChartTooltip must be called in chartist eventListener plugin
 * and chartTooltipSelector must be set.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import identifyHoveredValuesColumn from 'onedata-gui-common/utils/chartist/identify-hovered-values-column';
import Mixin from '@ember/object/mixin';
import { reads } from '@ember/object/computed';
import $ from 'jquery';
import dom from 'onedata-gui-common/utils/dom';
import { run } from '@ember/runloop';

export default Mixin.create({
  /**
   * @virtual
   * @type {string}
   */
  chartTooltipSelector: undefined,

  /**
   * Possible values: top, bottom
   * @virtual
   * @type {string}
   */
  chartTooltipVerticalAlign: 'bottom',

  /**
   * Hovered column index (counting from the left side of the chart)
   * @type {Ember.ComputedProperty<boolean>}
   */
  chartTooltipHoveredColumn: reads('_ctHoveredPointsColumnIndex'),

  /**
   * @type {Ember.ComputedProperty<number>}
   */
  chartTooltipColumnsNumber: reads('_ctPointsColumnXPosition.length'),

  /**
   * @type {boolean}
   */
  _ctChartCreated: false,

  /**
   * @type {Array<number>}
   */
  _ctPointsColumnXPosition: Object.freeze([]),

  /**
   * @type {Array<number>}
   */
  _ctPointsColumnYPosition: Object.freeze([]),

  /**
   * @type {number}
   */
  _ctHoveredPointsColumnIndex: -1,

  /**
   * Adds needed listeners to draw values line
   * @param {object} eventData chartist event data
   * @returns {undefined}
   */
  addChartTooltip(eventData) {
    safeExec(this, '_ctEventHandler', eventData);
  },

  /**
   * Event handler
   * @param {object} eventData chartist event data
   * @returns {undefined}
   */
  _ctEventHandler(eventData) {
    const {
      eventName,
      data,
      chart,
    } = eventData;
    if ((eventName === 'draw' && this.get('_ctChartCreated')) ||
      data.type === 'initial') {
      this.setProperties({
        _ctChartCreated: false,
        _ctPointsColumnXPosition: [],
        _ctPointsColumnYPosition: [],
      });
    }
    if (eventName === 'draw' && data.type === 'point') {
      this._ctRememberChartPointCoordinates(data);
    }
    if (eventName === 'created') {
      this._ctAttachValuesColumnHoverListeners(chart);
      this._ctShowTooltipIfNeeded();
      this.set('_ctChartCreated', true);
    }
  },

  /**
   * Persists coordinates of drawed point
   * @param {object} data chart event data
   * @returns {undefined}
   */
  _ctRememberChartPointCoordinates(data) {
    const {
      _ctPointsColumnXPosition,
      _ctPointsColumnYPosition,
      chartTooltipVerticalAlign,
    } = this.getProperties(
      '_ctPointsColumnXPosition',
      '_ctPointsColumnYPosition',
      'chartTooltipVerticalAlign');
    const pointNode = data.element.getNode();
    const pointXCenter = (pointNode.x1.baseVal.value + pointNode.x2.baseVal.value) / 2;
    const pointYCenter = (pointNode.y1.baseVal.value + pointNode.y2.baseVal.value) / 2;
    if (!_ctPointsColumnXPosition[data.index]) {
      _ctPointsColumnXPosition[data.index] = pointXCenter;
    }
    if (typeof _ctPointsColumnYPosition[data.index] !== 'number' ||
      (chartTooltipVerticalAlign === 'bottom' && _ctPointsColumnYPosition[data.index] >
        pointYCenter ||
        chartTooltipVerticalAlign === 'top' && _ctPointsColumnYPosition[data.index] <
        pointYCenter)) {
      _ctPointsColumnYPosition[data.index] = pointYCenter;
    }
  },

  /**
   * Attaches listeners, that are responsible for monitoring actual hovered
   * values column
   * @param {object} chart chart object
   * @returns {undefined}
   */
  _ctAttachValuesColumnHoverListeners(chart) {
    $(chart.container).mousemove((event) => run(() => {
        safeExec(this, () => {
          this.set(
            '_ctHoveredPointsColumnIndex',
            identifyHoveredValuesColumn(event, chart, this.get(
              '_ctPointsColumnXPosition'))
          );
          this._ctShowTooltipIfNeeded();
        });
      }))
      .mouseleave(() => run(() => {
        safeExec(this, () => {
          this.set('_ctHoveredPointsColumnIndex', -1);
          this._ctShowTooltipIfNeeded();
        });
      }));
  },

  /**
   * Shows/hides tooltip
   * @returns {undefined}
   */
  _ctShowTooltipIfNeeded() {
    const {
      _ctHoveredPointsColumnIndex,
      chartTooltipSelector,
      chartTooltipVerticalAlign,
    } = this.getProperties(
      '_ctHoveredPointsColumnIndex',
      'chartTooltipSelector',
      'chartTooltipVerticalAlign',
    );

    const tooltip = this.element?.querySelector(chartTooltipSelector);
    if (!tooltip) {
      return;
    }
    if (_ctHoveredPointsColumnIndex !== -1) {
      const {
        _ctPointsColumnXPosition,
        _ctPointsColumnYPosition,
      } = this.getProperties('_ctPointsColumnXPosition', '_ctPointsColumnYPosition');
      const chartContainer = this.element.querySelector('.ct-chart');
      const chartXCenter = dom.width(chartContainer) / 2;
      dom.setStyles(tooltip, {
        top: _ctPointsColumnYPosition[_ctHoveredPointsColumnIndex] + 'px',
        left: _ctPointsColumnXPosition[_ctHoveredPointsColumnIndex] + 'px',
      });
      if (_ctPointsColumnXPosition[_ctHoveredPointsColumnIndex] < chartXCenter) {
        tooltip.classList.add('right');
        tooltip.classList.remove('left');
      } else {
        tooltip.classList.add('left');
        tooltip.classList.remove('right');
      }
      if (chartTooltipVerticalAlign === 'top') {
        tooltip.classList.add('top');
        tooltip.classList.remove('bottom');
      } else {
        tooltip.classList.add('bottom');
        tooltip.classList.remove('top');
      }
      dom.setStyle(tooltip, 'display', 'block');
    } else {
      dom.setStyle(tooltip, 'display', 'none');
    }
  },
});
