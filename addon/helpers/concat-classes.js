/**
 * Return concatenated class names
 *
 * @module helpers/concat-classes
 * @author Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';

const {
  assert,
} = Ember;

export function concatClasses(params/*, hash*/) {
  let classes = '';
  params.forEach(param => {
    if (param) {
      assert("Class name must be a string.", typeof param === 'string');
      classes += param + ' ';
    }
  });
  // remove trailing space
  return classes.trim();
}

export default Ember.Helper.helper(concatClasses);
