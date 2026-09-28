/**
 * Clipboard secret form field. The secret is displayed as dots by default
 * and can be revealed or hidden by clicking on button.
 *
 * @author Agnieszka Raczek
 * @copyright (C) 2026 Onedata (onedata.org)
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import FormField from 'onedata-gui-common/utils/form-component/form-field';

export default FormField.extend({
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
