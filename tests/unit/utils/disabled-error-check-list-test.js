import { expect } from 'chai';
import { describe, it } from 'mocha';
import DisabledErrorCheckList from 'onedata-gui-common/utils/disabled-error-check-list';

describe('Unit | Utility | disabled error check list', function () {
  class FakeStorage {
    constructor(storage = {}) {
      this.storage = storage;
    }

    setItem(key, value) {
      this.storage[key] = value;
    }

    getItem(key) {
      return this.storage[key];
    }

    removeItem(key) {
      delete this.storage[key];
    }
  }

  it('adds id to disable error check to storage', function () {
    const type = 'someResource';
    const id = 'some1';
    const disabledCheckList = new DisabledErrorCheckList(type, new FakeStorage());

    disabledCheckList.disableErrorCheckFor(id);

    expect(disabledCheckList.hasDisabledErrorCheckFor(id)).to.be.true;
  });

  it('removes id to disable error check to storage', function () {
    const type = 'someResource';
    const id = 'some1';
    const disabledCheckList = new DisabledErrorCheckList(type, new FakeStorage());

    disabledCheckList.disableErrorCheckFor(id);
    disabledCheckList.enableErrorCheckFor(id);

    expect(disabledCheckList.hasEnabledErrorCheckFor(id)).to.be.true;
  });
});
