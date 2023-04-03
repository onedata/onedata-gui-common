import { expect } from 'chai';
import { describe, it } from 'mocha';
import isRecord from 'onedata-gui-common/utils/is-record';
import EmberObject from '@ember/object';

describe('Unit | Utility | is-record', function () {
  it('returns true if given object has "store" property', function () {
    const testObject = EmberObject.create({ store: {} });
    const result = isRecord(testObject);
    expect(result).to.be.true;
  });

  it('returns false if given object does not have "store" property', function () {
    const testObject = EmberObject.create({ abc: {} });
    const result = isRecord(testObject);
    expect(result).to.be.false;
  });
});
