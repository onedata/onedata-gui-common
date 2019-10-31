/**
 * Replaces dots with dashes in given string.
 *
 * @module utils/dot-to-dash
 * @author Michał Borzęcki
 * @copyright (C) 2017-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

const replaceRegex = new RegExp('\\.', 'g');

export default function dotToDash(string) {
  return string.replace(replaceRegex, '-');
}
