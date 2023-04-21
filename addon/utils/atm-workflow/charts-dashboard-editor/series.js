/**
 * Model of a single chart series for the dashboard editor.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject from '@ember/object';
import generateId from 'onedata-gui-common/utils/generate-id';
import { ElementType } from './common';

/**
 * @typedef {Object} TimeSeriesGeneratorRef
 * @property {string | null} collectionRef
 * @property {string} timeSeriesNameGenerator
 * @property {Array<string>} metricNames
 */

const Series = EmberObject.extend({
  /**
   * @public
   * @readonly
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.ElementType.Series}
   */
  elementType: ElementType.Series,

  /**
   * @public
   * @readonly
   * @type {unknown}
   */
  elementOwner: null,

  /**
   * @public
   * @virtual
   * @type {string}
   */
  id: undefined,

  /**
   * @public
   * @virtual optional
   * @type {boolean}
   */
  repeatPerPrefixedTimeSeries: false,

  /**
   * @public
   * @virtual optional
   * @type {EmberObject<TimeSeriesGeneratorRef> | null}
   */
  prefixedTimeSeriesRef: null,

  /**
   * @public
   * @virtual optional
   * @type {string}
   */
  name: '',

  /**
   * @public
   * @virtual optional
   * @type {OTSCChartType}
   */
  type: 'line',

  /**
   * `null` is an invalid state
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.Axis | null}
   */
  axis: null,

  /**
   * @public
   * @virtual optional
   * @type {string | null}
   */
  color: null,

  /**
   * @public
   * @virtual optional
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.SeriesGroup | null}
   */
  group: null,

  /**
   * @public
   * @virtual optional
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.Chart | null}
   */
  parentChart: null,

  /**
   * @override
   */
  init() {
    this._super(...arguments);
    if (!this.id) {
      this.set('id', generateId());
    }
  },

  /**
   * @override
   */
  willDestroy() {
    try {
      if (this.elementOwner) {
        this.set('elementOwner', null);
      }
      if (this.prefixedTimeSeriesRef) {
        this.prefixedTimeSeriesRef.destroy();
        this.set('prefixedTimeSeriesRef', null);
      }
      if (this.axis) {
        this.set('axis', null);
      }
      if (this.group) {
        this.set('group', null);
      }
      if (this.parentChart) {
        this.set('parentChart', null);
      }
    } finally {
      this._super(...arguments);
    }
  },

  /**
   * @public
   * @returns {Utils.AtmWorkflow.ChartsDashboardEditor.Series}
   */
  clone() {
    return Series.create({
      elementOwner: this.elementOwner,
      id: generateId(),
      repeatPerPrefixedTimeSeries: this.repeatPerPrefixedTimeSeries,
      prefixedTimeSeriesRef: this.prefixedTimeSeriesRef ?
        EmberObject.create(this.prefixedTimeSeriesRef) : this.prefixedTimeSeriesRef,
      name: this.name,
      type: this.type,
      axis: this.axis,
      color: this.color,
      group: this.group,
      parentChart: this.parentSection,
    });
  },
});

export default Series;
