import { computed, set } from '@ember/object';
import { reads } from '@ember/object/computed';
import { scheduleOnce } from '@ember/runloop';
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
   * @returns {number}
   */
  getFormValue() {
    return Number(this.formRootGroup.dumpValue().value);
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
