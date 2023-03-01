/**
 * A string value editor component.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed, observer, set } from '@ember/object';
import { reads } from '@ember/object/computed';
import { scheduleOnce } from '@ember/runloop';
import { not, conditional, raw, array } from 'ember-awesome-macros';
import autosize from 'onedata-gui-common/utils/autosize';
import EditorBase from '../commons/editor-base';
import FormFieldsRootGroup from 'onedata-gui-common/utils/form-component/form-fields-root-group';
import TextareaField from 'onedata-gui-common/utils/form-component/textarea-field';
import DropdownField from 'onedata-gui-common/utils/form-component/dropdown-field';
import layout from 'onedata-gui-common/templates/components/atm-workflow/value-editors/string/editor';

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
  didInsertElement() {
    const textarea = document.querySelector(
      `[data-editor-id="${this.editorState.id}"] textarea`
    );
    if (textarea) {
      autosize(textarea);
    }
  },

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
    this.editorState.value = this.getFormValue();
  },

  /**
   * @param {unknown} referenceValue
   * @returns {boolean}
   */
  doesFormValueDiffer(referenceValue) {
    return (this.getFormValue() ?? '') !== (referenceValue ?? '');
  },

  /**
   * @returns {string}
   */
  getFormValue() {
    return this.formRootGroup.dumpValue().value ?? '';
  },
});

const FormRootGroup = FormFieldsRootGroup.extend({
  /**
   * @virtual
   * @type {Components.AtmWorkflow.ValueEditors.String.Editor}
   */
  component: undefined,

  /**
   * @type {ComputedProperty<'text'|'dropdown'>}
   */
  editorType: conditional('valueConstraints.allowedValues', raw('dropdown'), raw('text')),

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
   * @type {ComputedProperty<AtmStringValueConstraints>}
   */
  valueConstraints: reads('component.editorState.atmDataSpec.valueConstraints'),

  fieldsSetter: observer(
    'valueConstraints.allowedValues',
    function fieldsSetter() {
      if (this.fields[0]?.editorType !== this.editorType) {
        this.fields.forEach((field) => field.destroy());

        const FieldClass = this.editorType === 'dropdown' ?
          DropdownValueInput : TextValueInput;
        this.set('fields', [FieldClass.create()]);
        this.fieldsParentSetter();
      }
    }
  ),

  /**
   * @override
   */
  init() {
    this._super(...arguments);
    this.fieldsSetter();
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
   * Allow empty string.
   * @override
   */
  isOptional: array.includes('parent.valueConstraints.allowedValues', raw('')),

  /**
   * @override
   */
  options: computed('parent.valueConstraints.allowedValues', function options() {
    return this.parent?.valueConstraints?.allowedValues
      ?.map((value) => ({ value, label: value })) ?? [];
  }),
});

const TextValueInput = TextareaField.extend({
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
   * Allow empty string.
   * @override
   */
  isOptional: true,

  /**
   * `autosize` library will take care of a real textarea height.
   * @override
   */
  rows: 1,
});
