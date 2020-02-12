import FormField from 'onedata-gui-common/utils/form-component/form-field';
import { computed } from '@ember/object';

export default FormField.extend({
  /**
   * @virtual
   */
  fieldComponentName: 'form-component/privileges-field',

  /**
   * @override
   */
  withValidationIcon: false,

  /**
   * @override
   */
  defaultValue: computed(() => []),

  /**
   * Grouped privileges used to construct tree nodes
   * @virtual
   * @type {Array<Object>}
   */
  privilegesGroups: computed(() => []),

  /**
   * Path to the translations of privilege groups names
   * @virtual
   * @type {String}
   */
  privilegeGroupsTranslationsPath: undefined,

  /**
   * Path to the translations of privileges names
   * @virtual
   * @type {String}
   */
  privilegesTranslationsPath: undefined,
});
