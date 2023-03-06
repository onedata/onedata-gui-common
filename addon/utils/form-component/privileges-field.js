/**
 * A privileges form field.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import FormField from 'onedata-gui-common/utils/form-component/form-field';
import { computed } from '@ember/object';

export default FormField.extend({
  /**
   * @override
   */
  fieldComponentName: 'form-component/privileges-field',

  /**
   * @override
   */
  withValidationIcon: false,

  /**
   * @override
   */
  isOptional: true,

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
