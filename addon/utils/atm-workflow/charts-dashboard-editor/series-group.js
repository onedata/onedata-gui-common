/**
 * Model of a single chart series group for the dashboard editor.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject from '@ember/object';
import generateId from 'onedata-gui-common/utils/generate-id';
import { ElementType } from './common';

const SeriesGroup = EmberObject.extend({
  /**
   * @public
   * @readonly
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.ElementType.SeriesGroup}
   */
  elementType: ElementType.SeriesGroup,

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
  subgroups: undefined,

  /**
   * @public
   * @virtual optional
   * @type {Array<Utils.AtmWorkflow.ChartsDashboardEditor.Series>}
   */
  series: undefined,

  /**
   * @public
   * @virtual optional
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.SeriesGroup | null}
   */
  parentGroup: null,

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
    if (!this.subgroups) {
      this.set('subgroups', []);
    }
    if (!this.series) {
      this.set('series', []);
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
      if (this.subgroups.length) {
        this.subgroups.forEach((subgroup) => subgroup.destroy());
        this.set('subgroups', []);
      }
      if (this.series.length) {
        this.set('series', []);
      }
      if (this.parentGroup) {
        this.set('parentGroup', null);
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
   * @returns {Utils.AtmWorkflow.ChartsDashboardEditor.SeriesGroup}
   */
  clone() {
    return SeriesGroup.create({
      elementOwner: this.elementOwner,
      id: generateId(),
      name: this.name,
      stacked: this.stacked,
      showSum: this.showSum,
      subgroups: this.subgroups.map((subgroup) => subgroup.clone()),
      series: [],
      parentGroup: this.parentGroup,
      parentChart: this.parentSection,
    });
  },

  /**
   * @public
   * @returns {Generator<Utils.AtmWorkflow.ChartsDashboardEditor.SeriesGroup>}
   */
  * getNestedGroups() {
    for (const subgroup of this.subgroups) {
      yield subgroup;
      yield* subgroup.getNestedGroups();
    }
  },
});

export default SeriesGroup;
