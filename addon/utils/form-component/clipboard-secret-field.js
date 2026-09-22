/**
 * A static text form field.
 *
 * @author Agnieszka Raczek
 * @copyright (C) 2026 Onedata (onedata.org)
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import StaticTextField from 'onedata-gui-common/utils/form-component/static-text-field';

export default StaticTextField.extend({
  /**
   * @override
   */
  fieldComponentName: 'form-component/clipboard-secret-field',

  /**
   * @virtual optional
   * @type {number}
   */
  textareaRows: 5,

  /**
   * @virtual optional
   * @type {string}
   */
  displayedText: '••••••',
});
