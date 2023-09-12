/**
 * Model of a single chart series group for the dashboard editor.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed, set } from '@ember/object';
import _ from 'lodash';
import ElementBase from './element-base';
import generateId from 'onedata-gui-common/utils/generate-id';
import { ElementType } from './common';

/**
 * @typedef {DashboardElementValidationError} SeriesGroupNameEmptyValidationError
 * @property {'seriesGroupNameEmpty'} errorId
 */

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
   * @override
   */
  referencingPropertyNames: Object.freeze(['parent', 'seriesGroups', 'series']),

  /**
   * @override
   */
  directValidationErrors: computed('name', function directValidationErrors() {
    if (!this.name) {
      return [{
        element: this,
        errorId: 'seriesGroupNameEmpty',
      }];
    } else {
      return [];
    }
  }),

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
   * @type {ComputedProperty<Array<Utils.AtmWorkflow.ChartsDashboardEditor.SeriesGroup>>}
   */
  deepSeriesGroups: computed(
    'seriesGroups.@each.deepSeriesGroups',
    function deepSeriesGroups() {
      const groups = [];
      this.seriesGroups.forEach((group) => {
        groups.push(group, ...group.deepSeriesGroups);
      });
      return groups;
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
    const clonedInstance = SeriesGroup.create({
      elementOwner: this.elementOwner,
      id: generateId(),
      name: this.name,
      stacked: this.stacked,
      showSum: this.showSum,
      seriesGroups: this.seriesGroups.map((subgroup) => subgroup.clone()),
      series: [],
      parent: this.parent,
    });
    clonedInstance.seriesGroups.forEach((element) => {
      set(element, 'parent', clonedInstance);
    });
    return clonedInstance;
  },

  /**
   * @override
   */
  toJson() {
    const groupJson = {
      id: this.id,
      name: this.name,
      stacked: this.stacked,
      showSum: this.showSum,
      subgroups: this.seriesGroups.map((subgroup) => subgroup.toJson()),
    };

    if (this.parent.elementType === ElementType.Chart) {
      return {
        builderType: 'static',
        builderRecipe: {
          seriesGroupTemplate: groupJson,
        },
      };
    }

    return groupJson;
  },

  /**
   * @override
   */
  * nestedElements() {
    for (const subgroup of this.seriesGroups) {
      yield subgroup;
      yield* subgroup.nestedElements();
    }
  },

  /**
   * @override
   */
  * referencingElements() {
    if (this.parent) {
      yield this.parent;
    }
    yield* this.series;
  },
});

export default SeriesGroup;
