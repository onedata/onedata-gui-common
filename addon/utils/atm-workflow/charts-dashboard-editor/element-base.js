/**
 * Base class for every dashboard model element.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject from '@ember/object';

const ElementBase = EmberObject.extend({
  /**
   * @public
   * @abstract
   * @readonly
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.ElementType}
   */
  elementType: undefined,

  /**
   * @public
   * @readonly
   * @type {unknown}
   */
  elementOwner: null,

  /**
   * @override
   */
  willDestroy() {
    try {
      if (this.elementOwner) {
        this.set('elementOwner', null);
      }
    } finally {
      this._super(...arguments);
    }
  },

  /**
   * @public
   * @abstract
   * @returns {Utils.AtmWorkflow.ChartsDashboardEditor.DashboardElement}
   */
  clone() {},

  /**
   * @public
   * @returns {Generator<Utils.AtmWorkflow.ChartsDashboardEditor.DashboardElement>}
   */
  * getNestedElements() {},
});

export default ElementBase;
