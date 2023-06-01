/**
 * A number value editor component.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed, observer, set } from '@ember/object';
import { reads } from '@ember/object/computed';
import { scheduleOnce } from '@ember/runloop';
import { not, bool, conditional, raw } from 'ember-awesome-macros';
import EditorBase from '../commons/editor-base';
import FormFieldsRootGroup from 'onedata-gui-common/utils/form-component/form-fields-root-group';
import NumberField from 'onedata-gui-common/utils/form-component/number-field';
import DropdownField from 'onedata-gui-common/utils/form-component/dropdown-field';
import layout from 'onedata-gui-common/templates/components/atm-workflow/value-editors/number/editor';

export default EditorBase.extend({
  layout,

  /**
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsRootGroup>}
   */
  formRootGroup: computed(function formRootGroup() {
    return FormRootGroup.create({ component: this });
  }),

  /**
   * @override
   */
  handleStateChange() {
    this._super(...arguments);
    if (!this.editorState) {
      return;
    }

    if (this.doesFormValueDiffer(this.editorState.value)) {
      const newValue = this.editorState.value ?? '';
      set(this.formRootGroup.valuesSource, 'value', String(newValue));
    }
  },

  /**
   * @returns {void}
   */
  propagateValueChange() {
    if (this.editorState) {
      this.editorState.value = this.getFormValue();
    }
  },

  /**
   * @param {unknown} referenceValue
   * @returns {boolean}
   */
  doesFormValueDiffer(referenceValue) {
    const formValue = this.getFormValue();
    return formValue !== referenceValue &&
      !(Number.isNaN(formValue) && Number.isNaN(referenceValue));
  },

  /**
   * @returns {number}
   */
  getFormValue() {
    return Number.parseFloat(this.formRootGroup.dumpValue().value);
  },
});

const FormRootGroup = FormFieldsRootGroup.extend({
  /**
   * @virtual
   * @type {Components.AtmWorkflow.ValueEditors.Number.Editor}
   */
  component: undefined,

  /**
   * @type {ComputedProperty<'text'|'dropdown'>}
   */
  editorType: conditional('atmDataSpec.allowedValues', raw('dropdown'), raw('text')),

  /**
   * @override
   */
  ownerSource: reads('component'),

  /**
   * @override
   */
  size: 'sm',

  /**
   * @override
   */
  isEnabled: not('component.isDisabled'),

  /**
   * @type {ComputedProperty<AtmNumberDataSpec>}
   */
  atmDataSpec: reads('component.editorState.atmDataSpec'),

  valueFieldSetter: observer(
    'atmDataSpec.allowedValues',
    function valueFieldSetter() {
      const valueField = this.getFieldByPath('value');
      const valueFieldIdx = valueField ? this.fields.indexOf(valueField) : 0;
      if (valueField?.editorType !== this.editorType) {
        const FieldClass = this.editorType === 'dropdown' ?
          DropdownValueInput : TextValueInput;
        const newValueField = FieldClass.create();

        if (valueField) {
          valueField.destroy();
          this.fields.replace(valueFieldIdx, 1, [newValueField]);
        } else {
          this.fields.insertAt(valueFieldIdx, newValueField);
        }

        this.fieldsParentSetter();
      }
    }
  ),

  /**
   * @override
   */
  init() {
    this._super(...arguments);
    this.valueFieldSetter();
  },

  /**
   * @override
   */
  onValueChange() {
    this._super(...arguments);
    scheduleOnce('afterRender', this.component, 'propagateValueChange');
  },
});

const DropdownValueInput = DropdownField.extend({
  /**
   * @type {'dropdown'}
   */
  editorType: 'dropdown',

  /**
   * @override
   */
  name: 'value',

  /**
   * @override
   */
  withValidationMessage: false,

  /**
   * @override
   */
  options: computed(
    'parent.atmDataSpec.{allowedValues,integersOnly}',
    function options() {
      const integersOnly = Boolean(this.parent?.atmDataSpec?.integersOnly);
      return this.parent?.atmDataSpec?.allowedValues
        ?.filter((value) => !integersOnly || Number.isInteger(value))
        ?.map((value) => ({
          value: String(value),
          label: String(value),
        })) ?? [];
    }
  ),
});

const TextValueInput = NumberField.extend({
  /**
   * @type {'text'}
   */
  editorType: 'text',

  /**
   * @override
   */
  name: 'value',

  /**
   * @override
   */
  withValidationMessage: false,

  /**
   * @override
   */
  integer: bool('parent.atmDataSpec.integersOnly'),
});
