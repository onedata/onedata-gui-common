import { expect } from 'chai';
import { describe, it } from 'mocha';
import isLegacyOneprovider from 'onedata-gui-common/utils/is-legacy-oneprovider';

describe('Unit | Utility | is legacy oneprovider', function () {
  it('detects legacy Oneprovider version', function () {
    const result = isLegacyOneprovider('19.02.2');
    expect(result).to.equal(true);
  });
  it('returns false for new Oneprovider', function () {
    const result = isLegacyOneprovider('20.02.0-beta1');
    expect(result).to.equal(false);
  });
});
