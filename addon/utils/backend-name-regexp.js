/**
 * Regular expression for matching valid names of objects in backend.
 * See: https://github.com/onedata/ctool/blob/develop/include/validation.hrl
 * 
 * @module utils/unicode-regexp
 * @author Jakub Liput
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { unicodeLetter } from 'onedata-gui-common/utils/unicode-regexp';

export const allowedChar = `(${unicodeLetter}|\\d|[()_])`
export const additionalMiddleChar = ' .-';
export const allowedMiddleChar = `(${allowedChar}|[${additionalMiddleChar}])`;

export default new RegExp(
  `^${allowedChar}${allowedMiddleChar}*${allowedChar}$`
);
