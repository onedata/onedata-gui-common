/**
 * A utility class responsible for passing global settings of every dashboard
 * editor element down to the editor components.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject from '@ember/object';

export default EmberObject.extend({
  /**
   * @virtual
   * @type {Utils.AtmWorkflow.ChartDashboardEditor.ActionsFactory}
   */
  actionsFactory: undefined,

  /**
   * @virtual optional
   * @type {boolean}
   */
  isReadOnly: false,

  /**
   * @override
   */
  willDestroy() {
    try {
      this.actionsFactory?.destroy();
    } finally {
      this._super(...arguments);
    }
  },
});
