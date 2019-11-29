import { expect } from 'chai';
import { describe, it } from 'mocha';
import PromiseArray, { promiseArray } from 'onedata-gui-common/utils/ember/promise-array';
import { resolve } from 'rsvp';
import { get } from '@ember/object';

describe('Unit | Utility | ember/promise array', function () {
  it('exports promise array class with promise and proxy capabilites', function () {
    const origData = [1, 2, 3];

    const proxy = PromiseArray.create({
      promise: resolve(origData),
    });

    expect(get(proxy, 'isSettled')).to.equal(false);
    expect(get(proxy, 'isFulfilled')).to.equal(false);
    return proxy.then((data) => {
      expect(data).to.equal(origData);
      expect(get(proxy, 'content')).to.equal(origData);
      expect(get(proxy, 'length')).to.equal(3);
      expect(proxy.objectAt(1)).to.equal(origData[1]);
      expect(get(proxy, 'isSettled')).to.equal(true);
      expect(get(proxy, 'isFulfilled')).to.equal(true);
      expect(get(proxy, 'isRejected')).to.equal(false);
    });
  });

  it('exports function for creating promise array', function () {
    const origData = [1, 2, 3];

    const proxy = promiseArray(resolve(origData));

    return proxy.then((data) => {
      expect(data).to.equal(origData);
      expect(proxy.objectAt(1)).to.equal(origData[1]);
    });
  });
});
