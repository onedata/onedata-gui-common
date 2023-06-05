/**
 * Using array of promise-production functions, launch and wait for resolve of promises
 * in limited batches. If at least one promise rejects, then this function also rejects.
 *
 * @author Jakub Liput
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { all as allFulfilled } from 'rsvp';

/**
 * @param {Array<() => Promise<T>>} promiseFunctions
 * @param {number} [chunkSize]
 * @returns {Proimse<Array<T>>}
 */
export default async function batchResolve(promiseFunctions, chunkSize = 10) {
  const allResults = [];
  for (const functionsChunk of arrayChunks(promiseFunctions, chunkSize)) {
    (await allFulfilled(functionsChunk.map(fun => fun()))).forEach(result => {
      allResults.push(result);
    });
  }
  return allResults;
}

/**
 * Yield subsequent slices of array with maximum size of `chunkSize`.
 * @param {Array} array
 * @param {number} chunkSize
 * @yields {Array}
 */
function* arrayChunks(array, chunkSize) {
  let i = 0;
  let chunk;
  do {
    chunk = array.slice(i * chunkSize, (i + 1) * chunkSize);
    if (chunk.length) {
      yield chunk;
      i += 1;
    }
  } while (chunk.length);
}
