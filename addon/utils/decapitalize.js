/**
 * Lowers first letter of a string.
 *
 * @author Jakub Liput
 * @copyright (C) 2019-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { htmlSafe } from '@ember/string';

export default function decapitalize(text) {
  if (text && text.string) {
    return htmlSafe(decapitalizeString(text.string));
  } else if (text instanceof String) {
    return decapitalizeString(text);
  } else {
    return decapitalizeString(text.toString());
  }
}

function decapitalizeString(text) {
  return text.charAt(0).toLowerCase() + text.substring(1);
}
