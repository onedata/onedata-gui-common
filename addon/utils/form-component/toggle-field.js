/**
 * A toggle form field.
 * 
 * @module utils/form-component/toggle-field
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import FormField from 'onedata-gui-common/utils/form-component/form-field';

export default FormField.extend({
  /**
   * @override
   */
  fieldComponentName: 'form-component/toggle-field',

  /**
   * @override
   */
  withValidationIcon: false,
})
