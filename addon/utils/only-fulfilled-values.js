/**
 * A function which returns a promise, which resolves to an array of values from the
 * promises, which have resolved. Rejected promises are ignored.
 * 
 * @module utils/only-fulfilled-values
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { allSettled } from 'rsvp';

/**
 * @param {Array<Promise<any>>} promisesArr 
 * @returns {Promise<Array<any>>} values received from resolved promises
 */
export default function onlyFulfilledValues(promisesArr) {
  return allSettled(promisesArr)
    .then(arr => arr.filterBy('state', 'fulfilled').mapBy('value'));
}
