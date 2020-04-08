/**
 * A component responsible for rendering static text field.
 *
 * @module components/form-component/static-text-field
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import FieldComponentBase from 'onedata-gui-common/components/form-component/field-component-base';
import layout from '../../templates/components/form-component/static-text-field';
import { or } from 'ember-awesome-macros';

export default FieldComponentBase.extend({
  layout,
  classNames: ['static-text-field'],

  /**
   * @type {ComputedProperty<String>}
   */
  text: or('field.value', 'field.text'),
});
