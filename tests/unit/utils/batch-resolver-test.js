import { expect } from 'chai';
import { describe, it } from 'mocha';
import _ from 'lodash';
import BatchResolver from 'onedata-gui-common/utils/batch-resolver';
import sleep from 'onedata-gui-common/utils/sleep';
import { resolve, defer } from 'rsvp';
import { settled } from '@ember/test-helpers';

describe('Unit | Utility | batch-resolver', async function () {
  it('executes next batch of promise functions after previous batch fulfills', async function () {
    const range = 100;
    const chunkSize = 10;
    const globalResults = _.range(0, range).map(() => false);
    const promiseFunctions = _.range(0, range).map(i => {
      return async () => {
        const requiredDataMaxIndex = (Math.floor(i / chunkSize) * chunkSize);
        expect(globalResults.slice(0, requiredDataMaxIndex).every(Boolean))
          .to.be.true;
        await sleep(_.random(0, 5));
        globalResults[i] = true;
      };
    });
    const batchResolver = BatchResolver.create({
      promiseFunctions,
    });

    await batchResolver.allFulfilled(promiseFunctions, chunkSize);
    expect(globalResults.every(Boolean)).to.be.true;
  });

  it('increases settledFunctionsCount when promises are fulfilled', async function () {
    const range = 9;
    const chunkSize = 3;
    const promisesDefer = defer();
    const promiseFunctions = _.range(0, range).map(i => {
      return () => {
        if (i < 5) {
          return resolve();
        } else {
          return promisesDefer.promise;
        }
      };
    });
    const batchResolver = BatchResolver.create({
      promiseFunctions,
    });

    batchResolver.allFulfilled(promiseFunctions, chunkSize);
    expect(batchResolver.settledFunctionsCount).to.equal(0);
    await settled();
    expect(batchResolver.settledFunctionsCount).to.equal(5);
    promisesDefer.resolve();
    await settled();
    expect(batchResolver.settledFunctionsCount).to.equal(range);
  });
});
