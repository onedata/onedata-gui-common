/**
 * Replaces dots with dashes in given string.
 *
 * @module helpers/dot-to-dash
 * @author Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';

const replaceRegex = new RegExp('\\.', 'g');

export function dotToDash([name] /*, hash*/ ) {
  return name.replace(replaceRegex, '-');
}

export default Ember.Helper.helper(dotToDash);
