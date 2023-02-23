import { expect } from 'chai';
import { describe, it } from 'mocha';
import isStandaloneGuiOneprovider from 'onedata-gui-common/utils/is-standalone-gui-oneprovider';

describe('Unit | Utility | is-standalone-gui-oneprovider', function () {
  it('detects standalone gui Oneprovider version', function () {
    const result = isStandaloneGuiOneprovider('19.02.2');
    expect(result).to.equal(true);
  });
  it('returns false for new Oneprovider beta1', function () {
    const result = isStandaloneGuiOneprovider('20.02.0-beta1');
    expect(result).to.equal(false);
  });
  it('returns false for any new Oneprovider', function () {
    const result = isStandaloneGuiOneprovider('21.04.1');
    expect(result).to.equal(false);
  });
});
