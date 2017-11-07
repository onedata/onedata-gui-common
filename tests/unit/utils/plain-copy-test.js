import { expect } from 'chai';
import { describe, it } from 'mocha';
import plainCopy from 'onedata-gui-common/utils/plain-copy';
import { default as EmberObject } from '@ember/object';
import { typeOf } from '@ember/utils';

describe('Unit | Utility | plain copy', function () {
  it('changes EmberObject with nested EmberObject to plain object', function () {
    const obj = EmberObject.create({
      one: EmberObject.create({
        two: 2,
      }),
    });
    const result = plainCopy(obj);
    expect(typeOf(result.one)).to.equal('object');
    expect(result.one.two).to.equal(2);
  });
});
