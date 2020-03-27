/**
 * Invokes function that returns Promise multiple times until it resolves.
 * 
 * If the promise always rejects within some `limit` counts, the result
 * promise rejects.
 * 
 * If the promise resolves for first time - the result promise resolves.
 * 
 * For usage examples see tests.
 * 
 * @module utils/try-until-resolve
 * @author Jakub Liput
 * @copyright (C) 2018-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { Promise } from 'rsvp';

export default function tryUntilResolve(fun, limit, interval = 1) {
  const promise = fun();
  return promise
    .catch(error => {
      if (limit <= 1) {
        throw error;
      } else {
        return new Promise(resolve => {
          setTimeout(() => resolve(
              tryUntilResolve(fun, limit - 1, interval)),
            interval
          );
        });
      }
    });
}
