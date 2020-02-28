/**
 * A datetime form field.
 * 
 * @module utils/form-component/datetime-field
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import FormField from 'onedata-gui-common/utils/form-component/form-field';

export default FormField.extend({
  /**
   * @virtual
   */
  fieldComponentName: 'form-component/datetime-field',

  /**
   * @virtual optional
   * @type {String}
   */
  viewModeFormat: 'YYYY/MM/DD H:mm',
})
