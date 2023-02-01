/**
 * A component responsible for rendering static field with user info.
 *
 * @author Jakub Liput
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import layout from '../../templates/components/form-component/static-user-field';
import { or } from 'ember-awesome-macros';
import FieldComponentBase from 'onedata-gui-common/components/form-component/field-component-base';

export default FieldComponentBase.extend({
  classNames: ['static-user-field'],

  layout,

  /**
   * @type {ComputedProperty<UserRecord>}
   */
  user: or('field.value', 'field.user'),
});
