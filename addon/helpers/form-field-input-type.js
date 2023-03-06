/**
 * Transforms type of form-field specification to type of HTML input which should
 * be used
 *
 * @author Jakub Liput
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { helper } from '@ember/component/helper';

export function formFieldInputType([fieldType] /*, hash*/ ) {
  return fieldType === 'number' ? 'text' : fieldType;
}

export default helper(formFieldInputType);
