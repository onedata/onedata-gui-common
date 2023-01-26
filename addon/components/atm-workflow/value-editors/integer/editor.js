import { computed, set } from '@ember/object';
import { reads } from '@ember/object/computed';
import { scheduleOnce } from '@ember/runloop';
import { not } from 'ember-awesome-macros';
import EditorBase from '../commons/editor-base';
import FormFieldsRootGroup from 'onedata-gui-common/utils/form-component/form-fields-root-group';
import NumberField from 'onedata-gui-common/utils/form-component/number-field';
import layout from 'onedata-gui-common/templates/components/atm-workflow/value-editors/integer/editor';

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
    return this.getFormValue() !== referenceValue &&
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
   * @type {Components.AtmWorkflow.ValueEditors.Integer.Editor}
   */
  component: undefined,

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
   * @override
   */
  fields: computed(() => [
    NumberField.create({
      name: 'value',
      integer: true,
      withValidationMessage: false,
    }),
  ]),

  /**
   * @override
   */
  onValueChange() {
    this._super(...arguments);
    scheduleOnce('afterRender', this.component, 'propagateValueChange');
  },
});
