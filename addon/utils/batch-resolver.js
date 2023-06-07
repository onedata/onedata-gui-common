/**
 * Exposes methods for executing promises that are returned from injected
 * promise-producing functions in batches.
 *
 * @author Jakub Liput
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject from '@ember/object';
import { all as allFulfilled, defer } from 'rsvp';
import { A } from '@ember/array';
import { array, or, raw, promise } from 'ember-awesome-macros';
import { reads } from '@ember/object/computed';

export default EmberObject.extend({
  /**
   * @virtual
   * @type {Array<() => Promise<T>>}
   */
  promiseFunctions: undefined,

  /**
   * @virtual optional
   * @type {number>}
   */
  chunkSize: 10,

  //#region state

  isStarted: false,

  allResults: undefined,

  promise: undefined,

  //#endregion

  promiseObject: promise.object('promise'),

  settledFunctionsCount: or(
    array.length('allResults'),
    raw(0),
  ),

  totalFunctionsCount: reads('promiseFunctions.length'),

  init() {
    this._super(...arguments);
    this.set('allResults', A());
  },

  /**
   * @public
   * @returns {Array<T>} `T` is the promise result type from `promiseFunctions`
   */
  async allFulfilled() {
    if (this.isStarted) {
      throw new Error('BatchResolver: promises resolving was already started');
    }
    const promiseFunctions = this.promiseFunctions;
    const chunkSize = this.chunkSize;
    if (!promiseFunctions || !chunkSize || chunkSize < 0) {
      throw new Error('BatchResolver: invalid promiseFunctions or chunksSize injected');
    }
    this.set('isStarted', true);
    const localDefer = defer();
    this.set('promise', localDefer.promise);
    if (this.allResults.length) {
      return this.allResults;
    }
    for (const functionsChunk of arrayChunks(this.promiseFunctions, this.chunkSize)) {
      await allFulfilled(functionsChunk.map(fun => {
        const resultingPromise = fun();
        (async () => {
          const result = await resultingPromise;
          this.addResult(result);
        })();
        return resultingPromise;
      }));
    }
    localDefer.resolve(this.allResults);
    return this.promise;
  },

  /**
   * @private
   */
  addResult(result) {
    this.allResults.pushObject(result);
  },
});

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
