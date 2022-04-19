import { expect } from 'chai';
import { describe, it } from 'mocha';
import { concatClasses } from 'onedata-gui-common/helpers/concat-classes';

describe('Unit | Helper | concat classes', function () {
  it('concats classes', function () {
    const result = concatClasses(['a', 'b', 'c d']);
    expect(result).to.be.equal('a b c d');
  });

  it('ignores empty values', function () {
    const result = concatClasses(['a', null, undefined, '']);
    expect(result).to.be.equal('a');
  });

  it('returns empty string for no classes', function () {
    const result = concatClasses([]);
    expect(result).to.be.equal('');
  });
});
