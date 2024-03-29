/**
 * A form field component adopting automation value editor to forms framework
 * usage.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { reads } from '@ember/object/computed';
import { and, not, or } from 'ember-awesome-macros';
import FieldComponentBase from 'onedata-gui-common/components/form-component/field-component-base';
import layout from 'onedata-gui-common/templates/components/atm-workflow/value-editors/value-editor-field';

export default FieldComponentBase.extend({
  layout,
  classNames: ['value-editor'],

  /**
   * @type {ComputedProperty<Utils.AtmWorkflow.ValueEditors.ValueEditorStateManager>}
   */
  editorStateManager: reads('field.editorStateManager'),

  /**
   * @type {ComputedProperty<boolean>}
   */
  isOptional: reads('field.isOptional'),

  /**
   * @type {ComputedProperty<boolean>}
   */
  isClearable: reads('isOptional'),

  /**
   * @type {ComputedProperty<SafeString>}
   */
  valueCreatorButtonLabel: reads('field.valueCreatorButtonLabel'),

  /**
   * @type {ComputedProperty<boolean>}
   */
  hasInvalidAtmDataSpec: not('field.atmDataSpec'),

  /**
   * @type {ComputedProperty<string>}
   */
  invalidAtmDataSpecMessage: reads('field.invalidAtmDataSpecMessage'),

  /**
   * @type {ComputedProperty<boolean>}
   */
  isValueCreatorButtonVisible: or(
    and('isClearable', not('value.hasValue')),
    'hasInvalidAtmDataSpec'
  ),

  actions: {
    createValue() {
      this.field.valueChanged({
        hasValue: true,
        value: this.editorStateManager.defaultValue,
      });
    },
    removeValue() {
      this.field.valueChanged({
        hasValue: false,
        value: null,
      });
    },
  },
});
