/**
 * Model of a single chart series group for the dashboard editor.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import _ from 'lodash';
import ElementBase from './element-base';
import generateId from 'onedata-gui-common/utils/generate-id';
import { ElementType } from './common';

const SeriesGroup = ElementBase.extend({
  /**
   * @override
   */
  elementType: ElementType.SeriesGroup,

  /**
   * @public
   * @virtual
   * @type {string}
   */
  id: undefined,

  /**
   * @public
   * @virtual optional
   * @type {string}
   */
  name: '',

  /**
   * @public
   * @virtual optional
   * @type {boolean}
   */
  stacked: false,

  /**
   * @public
   * @virtual optional
   * @type {boolean}
   */
  showSum: false,

  /**
   * @public
   * @virtual optional
   * @type {Array<Utils.AtmWorkflow.ChartsDashboardEditor.SeriesGroup>}
   */
  seriesGroups: undefined,

  /**
   * @public
   * @virtual optional
   * @type {Array<Utils.AtmWorkflow.ChartsDashboardEditor.Series>}
   */
  series: undefined,

  /**
   * @public
   * @virtual optional
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.Chart | Utils.AtmWorkflow.ChartsDashboardEditor.SeriesGroup | null}
   */
  parent: null,

  /**
   * @override
   */
  referencingPropertyNames: Object.freeze(['parent', 'seriesGroups', 'series']),

  /**
   * @override
   */
  nestedValidationErrors: computed(
    'seriesGroups.@each.validationErrors',
    function nestedValidationErrors() {
      return _.flatten(
        this.seriesGroups.map(({ validationErrors }) => validationErrors)
      );
    }
  ),

  /**
   * @override
   */
  init() {
    if (!this.id) {
      this.set('id', generateId());
    }
    if (!this.seriesGroups) {
      this.set('seriesGroups', []);
    }
    if (!this.series) {
      this.set('series', []);
    }

    this._super(...arguments);
  },

  /**
   * @override
   */
  willDestroy() {
    try {
      if (this.seriesGroups.length) {
        this.seriesGroups.forEach((subgroup) => subgroup.destroy());
        this.set('seriesGroups', []);
      }
      if (this.series.length) {
        this.set('series', []);
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
    return SeriesGroup.create({
      elementOwner: this.elementOwner,
      id: generateId(),
      name: this.name,
      stacked: this.stacked,
      showSum: this.showSum,
      seriesGroups: this.seriesGroups.map((subgroup) => subgroup.clone()),
      series: [],
      parent: this.parent,
    });
  },

  /**
   * @override
   */
  * getNestedElements() {
    for (const subgroup of this.seriesGroups) {
      yield subgroup;
      yield* subgroup.getNestedElements();
    }
  },

  /**
   * @override
   */
  * getReferencingElements() {
    if (this.parent) {
      yield this.parent;
    }
    yield* this.series;
  },
});

export default SeriesGroup;
