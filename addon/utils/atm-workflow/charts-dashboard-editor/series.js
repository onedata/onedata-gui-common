/**
 * Model of a single chart series for the dashboard editor.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject, { computed } from '@ember/object';
import ElementBase from './element-base';
import generateId from 'onedata-gui-common/utils/generate-id';
import { ElementType } from './common';

/**
 * @typedef {Object} TimeSeriesGeneratorRef
 * @property {string | null} collectionRef
 * @property {string} timeSeriesNameGenerator
 * @property {Array<string>} metricNames
 */

/**
 * @typedef {DashboardElementValidationError} SeriesAxisNotAssignedValidationError
 * @property {'seriesAxisNotAssigned'} errorId
 */

const Series = ElementBase.extend({
  /**
   * @override
   */
  elementType: ElementType.Series,

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
  parent: null,

  /**
   * @override
   */
  referencingPropertyNames: Object.freeze(['parent', 'axis', 'group']),

  /**
   * @override
   */
  directValidationErrors: computed('axis', function directValidationErrors() {
    if (!this.axis) {
      return [{
        element: this,
        errorId: 'seriesAxisNotAssigned',
      }];
    } else {
      return [];
    }
  }),

  /**
   * @override
   */
  init() {
    if (!this.id) {
      this.set('id', generateId());
    }

    this._super(...arguments);
  },

  /**
   * @override
   */
  willDestroy() {
    try {
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
      if (this.parent) {
        this.set('parent', null);
      }
    } finally {
      this._super(...arguments);
    }
  },

  /**
   * @override
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
      parent: this.parent,
    });
  },

  /**
   * @override
   */
  * getReferencingElements() {
    if (this.parent) {
      yield this.parent;
    }
    if (this.axis) {
      yield this.axis;
    }
    if (this.group) {
      yield this.group;
    }
  },
});

export default Series;
