/**
 * A component responsible for rendering clipboard field.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import FieldComponentBase from 'onedata-gui-common/components/form-component/field-component-base';
import layout from '../../templates/components/form-component/clipboard-field';
import { or } from 'ember-awesome-macros';
import { reads } from '@ember/object/computed';
import { and, raw, equal } from 'ember-awesome-macros';

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
   * @type {ComputedProperty<ClipboardFieldStyle>}
   */
  fieldStyle: reads('field.fieldStyle'),

  /**
   * @type {string}
   * Class for `clipboard-line` components.
   */
  clipboardLineClass: or(
    and(equal('fieldStyle', raw('monospace')), raw('monospace-font')),
    raw(''),
  ),
});
