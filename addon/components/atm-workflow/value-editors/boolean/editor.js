import { computed, set } from '@ember/object';
import { reads } from '@ember/object/computed';
import { scheduleOnce } from '@ember/runloop';
import { not } from 'ember-awesome-macros';
import EditorBase from '../commons/editor-base';
import FormFieldsRootGroup from 'onedata-gui-common/utils/form-component/form-fields-root-group';
import DropdownField from 'onedata-gui-common/utils/form-component/dropdown-field';
import layout from 'onedata-gui-common/templates/components/atm-workflow/value-editors/boolean/editor';

export default EditorBase.extend({
  layout,

  /**
   * @override
   */
  i18nPrefix: 'components.atmWorkflow.valueEditors.boolean.editor',

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
      set(this.formRootGroup.valuesSource, 'value', this.editorState.value);
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
    return this.getFormValue() !== referenceValue;
  },

  /**
   * @returns {number}
   */
  getFormValue() {
    return this.formRootGroup.dumpValue().value;
  },
});

const FormRootGroup = FormFieldsRootGroup.extend({
  /**
   * @virtual
   * @type {Components.AtmWorkflow.ValueEditors.Boolean.Editor}
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
  i18nPrefix: reads('component.i18nPrefix'),

  /**
   * @override
   */
  isEnabled: not('component.isDisabled'),

  /**
   * @override
   */
  fields: computed(() => [
    DropdownField.create({
      name: 'value',
      withValidationMessage: false,
      options: [{
        value: true,
      }, {
        value: false,
      }],
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
