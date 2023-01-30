/**
 * A component responsible for rendering static field with user info.
 *
 * @author Jakub Liput
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from '../../templates/components/form-component/static-user-field';
import { or } from 'ember-awesome-macros';

export default Component.extend({
  classNames: ['static-user-field'],

  layout,

  /**
   * @type {ComputedProperty<Models.User>}
   */
  user: or('field.value', 'field.user'),
});
