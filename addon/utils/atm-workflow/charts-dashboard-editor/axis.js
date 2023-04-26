/**
 * Model of a single chart axis for the dashboard editor.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject from '@ember/object';
import ElementBase from './element-base';
import generateId from 'onedata-gui-common/utils/generate-id';
import { ElementType } from './common';

const Axis = ElementBase.extend({
  /**
   * @override
   */
  elementType: ElementType.Axis,

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
   * @type {TimeSeriesStandardUnit | 'custom'}
   */
  unitName: 'none',

  /**
   * @public
   * @virtual optional
   * @type {EmberObject<BytesUnitOptions | BitsUnitFormat | CustomUnitOptions> | null}
   */
  unitOptions: null,

  /**
   * Is a string, when user entered an invalid value
   * @public
   * @virtual optional
   * @type {number | string | null}
   */
  minInterval: null,

  /**
   * @public
   * @virtual optional
   * @type {Array<Utils.AtmWorkflow.ChartsDashboardEditor.Series>}
   */
  series: undefined,

  /**
   * @public
   * @virtual optional
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.Chart | null}
   */
  parent: null,

  /**
   * @override
   */
  init() {
    this._super(...arguments);
    if (!this.id) {
      this.set('id', generateId());
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
      if (this.unitOptions) {
        this.unitOptions.destroy();
        this.set('unitOptions', null);
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
    return Axis.create({
      elementOwner: this.elementOwner,
      id: generateId(),
      name: this.name,
      unitName: this.unitName,
      unitOptions: this.unitOptions ?
        EmberObject.create(this.unitOptions) : this.unitOptions,
      minInterval: this.minInterval,
      series: [],
      parent: this.parent,
    });
  },
});

export default Axis;
