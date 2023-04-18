/**
 * Model of a single chart for the dashboard editor.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject from '@ember/object';
import { ElementType } from './common';

const Chart = EmberObject.extend({
  /**
   * @public
   * @readonly
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.ElementType.Chart}
   */
  elementType: ElementType.Chart,

  /**
   * @public
   * @readonly
   * @type {unknown}
   */
  elementOwner: null,

  /**
   * @public
   * @virtual optional
   * @type {string}
   */
  title: '',

  /**
   * @public
   * @virtual optional
   * @type {string}
   */
  titleTip: '',

  /**
   * @public
   * @virtual optional
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.Section | null}
   */
  parentSection: null,

  /**
   * @override
   */
  willDestroy() {
    try {
      if (this.elementOwner) {
        this.set('elementOwner', null);
      }
      if (this.parentSection) {
        this.set('parentSection', null);
      }
    } finally {
      this._super(...arguments);
    }
  },

  /**
   * @public
   * @returns {Utils.AtmWorkflow.ChartsDashboardEditor.Chart}
   */
  clone() {
    return Chart.create({
      elementOwner: this.elementOwner,
      title: this.title,
      titleTip: this.titleTip,
      parentSection: this.parentSection,
    });
  },

  /**
   * @public
   * @returns {Generator<void>}
   */
  * getNestedElements() {},
});

export default Chart;
