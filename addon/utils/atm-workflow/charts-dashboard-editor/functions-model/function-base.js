/**
 * Base model for all chart functions.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import ElementBase from '../element-base';
import { ElementType } from '../common';

export default ElementBase.extend({
  /**
   * @public
   * @virtual
   * @type {string}
   */
  name: undefined,

  /**
   * @public
   * @virtual
   * @type {Array<FunctionDataType>}
   */
  returnedTypes: undefined,

  /**
   * @public
   * @virtual optional
   * @type {Array<FunctionAttachableArgumentSpec>}
   */
  attachableArgumentSpecs: Object.freeze([]),

  /**
   * @public
   * @virtual optional
   * @type {boolean}
   */
  hasSettingsComponent: false,

  /**
   * @override
   */
  elementType: ElementType.Function,

  /**
   * @public
   * @virtual optional
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.Function | Utils.AtmWorkflow.ChartsDashboardEditor.Chart | null}
   */
  parent: null,

  /**
   * @override
   */
  willDestroy() {
    try {
      this.attachableArgumentSpecs.forEach(({ name, isArray }) => {
        if (this[name]) {
          if (isArray) {
            this[name].forEach((argElement) => argElement?.destroy?.());
          } else {
            this[name].destroy?.();
          }
          this.set(name, null);
        }
      });
    } finally {
      this._super(...arguments);
    }
  },
});
