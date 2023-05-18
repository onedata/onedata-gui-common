import { expect } from 'chai';
import { describe, it } from 'mocha';
import version from 'onedata-gui-common/utils/version';

describe('Unit | Utility | version', function () {
  it('returns true if a version comforms stable version requirement', function () {
    const requiredVersion = '21.02.2';
    const testedVersions = [
      '21.02.2',
      '21.02.3',
      '21.02.11',
      '22.02.1',
      '22.02.0-alpha1',
    ];
    for (const checkedVersion of testedVersions) {
      expect(
        version.isRequiredVersion(checkedVersion, requiredVersion),
        `checked version: ${checkedVersion} for required ${requiredVersion}`
      ).to.be.true;
    }
  });

  it('returns true if a version comforms unstable version requirement', function () {
    const requiredVersion = '21.02.0-alpha2';
    const testedVersions = [
      '21.02.1',
      '21.02.0-alpha3',
      '21.02.0-alpha10',
      '22.02.1',
      '22.02.0-alpha3',
    ];
    for (const checkedVersion of testedVersions) {
      expect(
        version.isRequiredVersion(checkedVersion, requiredVersion),
        `checked version: ${checkedVersion} for required ${requiredVersion}`
      ).to.be.true;
    }
  });

  it('returns false if a version does not comform stable version requirement', function () {
    const requiredVersion = '21.02.4';
    const testedVersions = [
      '21.02.3',
      '20.02.5',
    ];
    for (const checkedVersion of testedVersions) {
      expect(
        version.isRequiredVersion(checkedVersion, requiredVersion),
        `checked version: ${checkedVersion} for required: ${requiredVersion}`
      ).to.be.false;
    }
  });

  it('returns false if a version does not comform unstable version requirement', function () {
    const requiredVersion = '21.02.0-alpha11';
    const testedVersions = [
      '21.02.0-alpha4',
      '20.02.1',
    ];
    for (const checkedVersion of testedVersions) {
      expect(
        version.isRequiredVersion(checkedVersion, requiredVersion),
        `checked version: ${checkedVersion} for required: ${requiredVersion}`
      ).to.be.false;
    }
  });
});
