/**
 * Converts any string to name allowed by backend
 * 
 * @module utils/backendify-name
 * @author Jakub Liput
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import {
  allowedChar,
  allowedMiddleChar,
} from 'onedata-gui-common/utils/backend-name-regexp';

export const minLength = 2;
export const maxLength = 50;
const allowedMiddleCharRe = new RegExp(allowedMiddleChar);

export default function backendifyName(name) {
  let newName = name;
  const m = newName.match(
    new RegExp(
      `.*?(${allowedChar}+.*${allowedChar}+|${allowedChar}{1,${minLength}}).*?`
    )
  );
  newName = m && m[1] || '';
  newName = [...newName].map(c => allowedMiddleCharRe.test(c) ? c : '').join('');
  newName = newName.slice(0, maxLength);
  return newName;
}
