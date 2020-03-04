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
const allowedCharRe = new RegExp(allowedChar);
const allowedMiddleCharRe = new RegExp(allowedMiddleChar);

export default function backendifyName(name, padChar) {
  let newName = name.trim();
  if (!allowedCharRe.test(newName[0])) {
    newName = newName.slice(1, newName.length);
  }
  if (!allowedCharRe.test(newName[newName.length - 1])) {
    newName = newName.slice(0, newName.length - 1);
  }
  newName = [...newName].map(c => allowedMiddleCharRe.test(c) ? c : '').join('');
  newName = newName.trim();
  newName = newName.slice(0, maxLength);
  if (padChar) {
    newName = newName.padEnd(minLength, padChar);
  }
  return newName;
}
