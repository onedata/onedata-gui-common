/**
 * A color form field.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import FormField from 'onedata-gui-common/utils/form-component/form-field';

export default FormField.extend({
  /**
   * @override
   */
  fieldComponentName: 'form-component/color-field',

  /**
   * @override
   */
  withValidationIcon: false,

  /**
   * This input is too short to have a good-looking validation message below.
   * @override
   */
  withValidationMessage: false,
});
