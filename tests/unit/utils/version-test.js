import { expect } from 'chai';
import { describe, it } from 'mocha';
import Version from 'onedata-gui-common/utils/version';

describe('Unit | Utility | version', function () {
  it('returns true if a version conforms stable version requirement', function () {
    const requiredVersion = '20.02.2';
    const testedVersions = [
      // '20.02.2',
      // '20.02.3',
      // '20.02.11',
      // '21.02.1',
      // '21.02.0-alpha1',
      '25.0',
      // '25.0.1',
      // '25.1',
      // '27.3',
    ];
    for (const checkedVersion of testedVersions) {
      expect(
        Version.isRequiredVersion(checkedVersion, requiredVersion),
        `checked version: ${checkedVersion} for required ${requiredVersion}`
      ).to.be.true;
    }
  });

  it('returns true if a version conforms unstable version requirement', function () {
    const requiredVersion = '20.02.0-alpha2';
    const testedVersions = [
      '20.02.1',
      '20.02.0-alpha3',
      '20.02.0-alpha10',
      '21.02.1',
      '21.02.0-alpha3',
      '25.0',
      '25.0.1',
      '25.1',
      '27.3',
    ];
    for (const checkedVersion of testedVersions) {
      expect(
        Version.isRequiredVersion(checkedVersion, requiredVersion),
        `checked version: ${checkedVersion} for required ${requiredVersion}`
      ).to.be.true;
    }
  });

  const notConformSpecs = [
    // ---
    {
      requiredDecription: 'stable legacy',
      testedDescription: 'stable legacy',
      requiredVersion: '20.02.4',
      testedVersions: [
        '19.02.5',
        '20.02.3',
      ],
    },
    {
      requiredDescription: 'unstable legacy',
      testedDescription: 'various legacy',
      requiredVersion: '20.02.0-alpha11',
      testedVersions: [
        '19.02.1',
        '20.02.0-alpha4',
      ],
    },
    {
      requiredDescription: 'stable',
      testedDescription: 'various legacy',
      requiredVersion: '25.0',
      testedVersions: [
        '19.02.1',
        '20.02.0-alpha4',
      ],
    },
    {
      requiredDescription: 'stable with patch',
      testedDescription: 'various legacy',
      requiredVersion: '25.0.1',
      testedVersions: [
        '19.02.1',
        '20.02.0-alpha4',
      ],
    },
    {
      requiredDescription: 'stable',
      testedDescription: 'stable',
      requiredVersion: '25.3',
      testedVersions: [
        '25.1',
        '25.2.3',
      ],
    },
    {
      requiredDescription: 'stable with patch',
      testedDescription: 'stable',
      requiredVersion: '25.3.4',
      testedVersions: [
        '25.0',
        '25.0.1',
        '25.3',
        '25.3.2',
      ],
    },
  ];

  for (const spec of notConformSpecs) {
    const {
      requiredDescription,
      testedDescription,
      requiredVersion,
      testedVersions,
    } = spec;
    const description =
      `returns false if a ${requiredDescription} version does not conform requirement for ${testedDescription} versions`;
    it(description, function () {
      for (const checkedVersion of testedVersions) {
        expect(
          Version.isRequiredVersion(checkedVersion, requiredVersion),
          `checked version: ${checkedVersion} against required: ${requiredVersion}`
        ).to.be.false;
      }
    });
  }

  it('can be used to sort versions in ascending order', function () {
    const unsortedVersions = [
      '21.02.11',
      '21.02.3',
      '25.0.2',
      '27.1.1',
      '26.1',
      '21.02.0-alpha3',
      '27.1',
      '25.0',
      '21.02.2',
      '26.0',
      '20.02.2',
      '25.0.1',
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
      '25.0',
      '25.0.1',
      '25.0.2',
      '26.0',
      '26.1',
      '27.1',
      '27.1.1',
    ]);
  });

  it('converts Onedata versions to SemVer', function () {
    const versionsMapping = {
      '20.02.0-alpha10': '20.2.0-alpha.10',
      '20.02.2': '20.2.2',
      '21.02.1-alpha3': '21.2.1-alpha.3',
      '21.02.3': '21.2.3',
      '25.0': '25.0.0',
      '25.0.1': '25.0.1',
      '26.1': '26.1.0',
      '26.0-rc.1': '26.0.0-rc.1',
      '26.1.2-alpha.1': '26.1.2-alpha.1',
    };
    for (const [sourceVersion, targetVersion] of Object.entries(versionsMapping)) {
      expect(Version.semversionize(sourceVersion)).to.equal(targetVersion);
    }
  });
});
