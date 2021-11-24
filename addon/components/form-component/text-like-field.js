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
import { computed } from '@ember/object';

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

  /**
   * Field used by numeric inputs only
   * @type {ComputedProperty<String>}
   */
  step: computed('field.step', function step() {
    const fieldStep = this.get('field.step');
    return (fieldStep === null || fieldStep === undefined) ? 'any' : String(fieldStep);
  }),
});
