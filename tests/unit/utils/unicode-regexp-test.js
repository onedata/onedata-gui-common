import { expect } from 'chai';
import { describe, it } from 'mocha';
import { unicodeLetter } from 'onedata-gui-common/utils/unicode-regexp';

describe('Unit | Utility | unicode letter regexp', function () {
  it('exports string for composing unicode letters regexp', function () {
    const re = new RegExp(`_${unicodeLetter}+_`);
    expect('_normal_', 'ascii').to.match(re);
    expect('_א_', 'single unicode').to.match(re);
    expect('_zażółć_', 'multi unicode').to.match(re);
    expect('_zaż!ółć_', 'special characters').to.not.match(re);
  });
});
