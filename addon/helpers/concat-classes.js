/**
 * Return concatenated class names
 *
 * @author Michał Borzęcki
 * @copyright (C) 2017-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { helper } from '@ember/component/helper';

import { assert } from '@ember/debug';

export function concatClasses(params /*, hash*/ ) {
  let classes = '';
  params.forEach(param => {
    if (param) {
      let normalizedParam = param;
      if (Array.isArray(normalizedParam)) {
        assert(
          'Class name must be a string.',
          normalizedParam.every((cls) => typeof cls === 'string')
        );
        normalizedParam = normalizedParam.filter(Boolean).join(' ');
      } else {
        assert('Class name must be a string.', typeof normalizedParam === 'string');
      }
      classes += param + ' ';
    }
  });
  // remove trailing space
  return classes.trim();
}

export default helper(concatClasses);
