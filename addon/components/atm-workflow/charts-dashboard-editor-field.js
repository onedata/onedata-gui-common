/**
 * A field element component which renders charts dashboard editor.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { reads } from '@ember/object/computed';
import FieldComponentBase from 'onedata-gui-common/components/form-component/field-component-base';
import layout from 'onedata-gui-common/templates/components/atm-workflow/charts-dashboard-editor-field';

export default FieldComponentBase.extend({
  layout,
  classNames: ['charts-dashboard-editor-field'],

  /**
   * @type {ComputedProperty<DashboardModelOwner>}
   */
  dashboardModelOwner: reads('field.dashboardModelOwner'),

  /**
   * @type {ComputedProperty<SafeString>}
   */
  buttonLabel: reads('field.buttonLabel'),

  actions: {
    showEditor() {
      return this.field.showEditor();
    },
  },
});
