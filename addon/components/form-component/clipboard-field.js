/**
 * A component responsible for rendering clipboard field.
 *
 * @module components/form-component/clipboard-field
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import FieldComponentBase from 'onedata-gui-common/components/form-component/field-component-base';
import layout from '../../templates/components/form-component/clipboard-field';
import { or } from 'ember-awesome-macros';
import { reads } from '@ember/object/computed';

export default FieldComponentBase.extend({
  layout,
  classNames: ['clipboard-field'],

  /**
   * @type {ComputedProperty<String>}
   */
  text: or('field.value', 'field.text'),

  /**
   * @type {ComputedProperty<String>}
   */
  type: reads('field.type'),

  /**
   * @type {ComputedProperty<number>}
   */
  textareaRows: reads('field.textareaRows'),

  /**
   * @type {ComputedProperty<String>}
   */
  clipboardLineClass: reads('field.clipboardLineClass'),
});
