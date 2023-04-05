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
      title: this.title,
      titleTip: this.titleTip,
      parentSection: this.parentSection,
    });
  },
});

export default Chart;
