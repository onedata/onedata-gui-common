/**
 * A static form field presenting user record.
 *
 * @author Jakub Liput
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import FormField from 'onedata-gui-common/utils/form-component/form-field';

export default FormField.extend({
  /**
   * @override
   */
  fieldComponentName: 'form-component/static-user-field',

  /**
   * @override
   */
  isValid: true,

  /**
   * Optionally, you can specify user record in this field instead of value.
   * @virtual optional
   * @type {UserRecord}
   */
  user: undefined,
});
