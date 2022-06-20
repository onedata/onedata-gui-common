import FormField from 'onedata-gui-common/utils/form-component/form-field';
import generateId from 'onedata-gui-common/utils/generate-id';

export const FormElement = FormField.extend({
  /**
   * @override
   */
  fieldComponentName: 'atm-workflow/data-spec-editor',

  /**
   * @override
   */
  withValidationIcon: false,
});

export function dataSpecToFormValues(dataSpec) {
  if (!dataSpec) {
    return {
      id: generateId(),
      type: 'dataTypeSelector',
    };
  }
}
