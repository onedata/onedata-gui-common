import { expect } from 'chai';
import { describe, it } from 'mocha';
import batchResolve from 'onedata-gui-common/utils/batch-resolve';
import sleep from 'onedata-gui-common/utils/sleep';
import _ from 'lodash';

describe('Unit | Utility | batch-resolve', function () {
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

    await batchResolve(promiseFunctions, chunkSize);
    expect(globalResults.every(Boolean)).to.be.true;
  });
});
