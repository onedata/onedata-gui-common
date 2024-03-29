import { expect } from 'chai';
import {
  describe,
  it,
} from 'mocha';
import conflictIds from 'onedata-gui-common/utils/conflict-ids';

describe('Unit | Utility | conflict-ids', function () {
  it('generates ids with length greater than 3 if both ids are completely different',
    function () {
      const result = conflictIds([
        'onetwothree',
        'fourfivesix',
        'seveneightten',
      ]);

      expect(result.length).to.equal(3);

      const [resultA, resultB, resultC] = result;
      expect(resultA).to.equal('onet');
      expect(resultB).to.equal('four');
      expect(resultC).to.equal('seve');
    });

  it('generates ids with length of minimum different ids', function () {
    const result = conflictIds([
      'somestring111',
      'somestring211',
      'somestring311',
    ]);

    expect(result.length).to.equal(3);

    const [resultA, resultB, resultC] = result;
    expect(resultA).to.equal('somestring1');
    expect(resultB).to.equal('somestring2');
    expect(resultC).to.equal('somestring3');
  });

  it('generates ids maximum length of their original', function () {
    const result = conflictIds([
      'so',
      'somes211',
      'somestring311',
    ]);

    expect(result.length).to.equal(3);

    const [resultA, resultB, resultC] = result;
    expect(resultA).to.equal('so');
    expect(resultB).to.equal('somes2');
    expect(resultC).to.equal('somest');
  });

  it('generates ids with equal length for differen pair differences', function () {
    const result = conflictIds([
      'somest123',
      'somest456',
      'ringt789123',
      'ringt789abcd',
    ]);

    expect(result.length).to.equal(4);

    const [resultA, resultB, resultC, resultD] = result;
    expect(resultA).to.equal('somest123');
    expect(resultB).to.equal('somest456');
    expect(resultC).to.equal('ringt7891');
    expect(resultD).to.equal('ringt789a');
  });
});
