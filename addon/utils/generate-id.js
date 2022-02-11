/**
 * Generates ids as similar as possible to the backend ones.
 *
 * @module utils/generate-id
 * @author Michał Borzęcki
 * @copyright (C) 2021-2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

const allowedChars = '0123456789abcdef';

export default function generateId() {
  let id = '';
  for (let i = 0; i < 38; i++) {
    id += allowedChars[Math.floor(Math.random() * 16)];
  }
  return id;
}
