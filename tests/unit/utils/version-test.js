import { expect } from 'chai';
import { describe, it } from 'mocha';
import Version from 'onedata-gui-common/utils/version';

describe('Unit | Utility | version', function () {
  it('returns true if a version conforms stable version requirement', function () {
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
        Version.isRequiredVersion(checkedVersion, requiredVersion),
        `checked version: ${checkedVersion} for required ${requiredVersion}`
      ).to.be.true;
    }
  });

  it('returns true if a version conforms unstable version requirement', function () {
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
        Version.isRequiredVersion(checkedVersion, requiredVersion),
        `checked version: ${checkedVersion} for required ${requiredVersion}`
      ).to.be.true;
    }
  });

  it('returns false if a version does not conform stable version requirement', function () {
    const requiredVersion = '21.02.4';
    const testedVersions = [
      '21.02.3',
      '20.02.5',
    ];
    for (const checkedVersion of testedVersions) {
      expect(
        Version.isRequiredVersion(checkedVersion, requiredVersion),
        `checked version: ${checkedVersion} for required: ${requiredVersion}`
      ).to.be.false;
    }
  });

  it('returns false if a version does not conform unstable version requirement', function () {
    const requiredVersion = '21.02.0-alpha11';
    const testedVersions = [
      '21.02.0-alpha4',
      '20.02.1',
    ];
    for (const checkedVersion of testedVersions) {
      expect(
        Version.isRequiredVersion(checkedVersion, requiredVersion),
        `checked version: ${checkedVersion} for required: ${requiredVersion}`
      ).to.be.false;
    }
  });

  it('can be used to sort versions in ascending order', function () {
    const unsortedVersions = [
      '21.02.11',
      '21.02.3',
      '22.02.0-alpha1',
      '21.02.0-alpha3',
      '21.02.2',
      '20.02.2',
      '20.02.0-alpha10',
      '21.02.4',
    ];
    const sortedVersions = [...unsortedVersions].sort(Version.compareVersions);

    expect(sortedVersions).to.deep.equal([
      '20.02.0-alpha10',
      '20.02.2',
      '21.02.0-alpha3',
      '21.02.2',
      '21.02.3',
      '21.02.4',
      '21.02.11',
      '22.02.0-alpha1',
    ]);
  });
});
