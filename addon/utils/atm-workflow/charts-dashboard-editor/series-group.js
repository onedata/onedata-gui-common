/**
 * Model of a single chart series group for the dashboard editor.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

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
   * @override
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
      parentChart: this.parentChart,
    });
  },

  /**
   * @override
   */
  * getNestedElements() {
    for (const subgroup of this.subgroups) {
      yield subgroup;
      yield* subgroup.getNestedElements();
    }
  },
});

export default SeriesGroup;
