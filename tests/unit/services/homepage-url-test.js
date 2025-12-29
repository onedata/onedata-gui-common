import { expect } from 'chai';
import { describe, it, context } from 'mocha';
import { setupTest } from 'ember-mocha';
import { simplifyVersion } from 'onedata-gui-common/services/homepage-url';

describe('Unit | Service | homepage-url', function () {
  setupTest();

  context('simplifyVersion util', function () {
    const mapping = {
      '21.02.3': '21.02',
      '20.02.8': '20.02',
      '25.0': '25',
      '25.0.1': '25',
      '25.1': '25',
      '25.1.3': '25',
    };

    for (const [fullVersion, docsVersion] of Object.entries(mapping)) {
      it(`returns ${docsVersion} homepage docs version for ${fullVersion}`, function () {
        expect(simplifyVersion(fullVersion)).to.equal(docsVersion);
      });
    }

    it('returns undefined for stable version string', function () {
      expect(simplifyVersion('stable')).to.equal(undefined);
    });
  });
});
