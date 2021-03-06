/**
 * A component responsible for rendering fields using text-like inputs (text,
 * number, email etc.).
 *
 * @module components/form-component/text-like-field
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import FieldComponentBase from 'onedata-gui-common/components/form-component/field-component-base';
import layout from '../../templates/components/form-component/text-like-field';
import { reads } from '@ember/object/computed';

export default FieldComponentBase.extend({
  layout,
  classNames: ['text-like-field'],

  /**
   * @type {ComputedProperty<SafeString>}
   */
  placeholder: reads('field.placeholder'),

  /**
   * @type {ComputedProperty<String>}
   */
  inputType: reads('field.inputType'),
});
