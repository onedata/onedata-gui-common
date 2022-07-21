/**
 * Evaluates function (the first parameter) with the passed arguments
 * (the rest of the parameters) and returns received value.
 *
 * If the first parameter is not a function, `undefined` will be returned.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { helper } from '@ember/component/helper';

export function evaluateFunction(params) {
  const [func, ...funcArgs] = params;
  if (typeof func !== 'function') {
    return undefined;
  }
  return func(...funcArgs);
}

export default helper(evaluateFunction);
