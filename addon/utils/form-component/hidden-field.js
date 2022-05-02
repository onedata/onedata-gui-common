/**
 * A hidden form field. Can be used to contain some additional values in forms
 * without rendering them.
 *
 * @module utils/form-component/hidden-field
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import FormField from 'onedata-gui-common/utils/form-component/form-field';

export default FormField.extend({
  /**
   * @override
   */
  fieldComponentName: null,
});
