import { computed, set } from '@ember/object';
import { reads } from '@ember/object/computed';
import { scheduleOnce } from '@ember/runloop';
import autosize from 'onedata-gui-common/utils/autosize';
import EditorBase from '../commons/editor-base';
import FormFieldsRootGroup from 'onedata-gui-common/utils/form-component/form-fields-root-group';
import TextareaField from 'onedata-gui-common/utils/form-component/textarea-field';
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
  fields: computed(() => [
    TextareaField.create({
      name: 'value',
      withValidationMessage: false,
      // allows empty string
      isOptional: true,
      rows: 1,
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
