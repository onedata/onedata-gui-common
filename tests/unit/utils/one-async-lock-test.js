import { expect } from 'chai';
import { describe, it } from 'mocha';
import OneAsyncLock from 'onedata-gui-common/utils/one-async-lock';
import sleep from 'onedata-gui-common/utils/sleep';
import { all as allFulfilled } from 'rsvp';

describe('Unit | Utility | one async lock', function () {
  it('forces async code block between acquire and release to be executed in whole', async function () {
    const lock = new OneAsyncLock();
    const globalArray = [];
    const fun = async (items) => {
      await lock.acquire();
      try {
        for (const item of items) {
          globalArray.push(item);
          await sleep(0);
        }
      } finally {
        await lock.release();
      }
    };
    const promiseA = fun([1, 2, 3]);
    const promiseB = fun(['a', 'b', 'c']);
    const promiseC = fun(['x', 'y', 'z']);
    const promiseD = fun([4, 5, 6]);
    await allFulfilled([promiseA, promiseB, promiseC, promiseD]);

    expect(globalArray, globalArray).to.deep.equal(
      [1, 2, 3, 'a', 'b', 'c', 'x', 'y', 'z', 4, 5, 6]
    );
  });
});
