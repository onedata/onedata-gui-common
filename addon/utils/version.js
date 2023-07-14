/**
 * Utilities to compare Onedata sevice versions
 *
 * @author Jakub Liput
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

export default {
  isRequiredVersion,
  parseVersion,
  compareVersions,
  compareMinorVersions,
};

/**
 * @param {string} version
 * @param {string} minVersion
 * @returns {boolean}
 */
export function isRequiredVersion(version, minVersion) {
  if (version === minVersion) {
    return true;
  }
  const parsedVersion = parseVersion(version);
  const parsedMinVersion = parseVersion(minVersion);
  if (!parsedVersion || !parsedMinVersion) {
    console.error('isRequiredVersion: must specify both valid version and minVersion');
    return false;
  }
  if (parsedVersion.major > parsedMinVersion.major) {
    return true;
  }
  if (parsedVersion.major < parsedMinVersion.major) {
    return false;
  }
  return compareMinorVersions(parsedVersion.minor, parsedMinVersion.minor) >= 0;
}

export function parseVersion(version) {
  const matchResult = version?.match(/(\d+\.\d+)\.(.+)/);
  if (!matchResult) {
    return null;
  }
  const [, major, minor] = matchResult;
  return {
    major,
    minor,
  };
}

export function compareVersions(aVer, bVer) {
  if (aVer === bVer) {
    return 0;
  }
  const { major: aMajor, minor: aMinor } = parseVersion(aVer);
  const { major: bMajor, minor: bMinor } = parseVersion(bVer);
  if (aMajor === bMajor) {
    return compareMinorVersions(aMinor, bMinor);
  } else if (aMajor < bMajor) {
    return -1;
  } else if (aMajor > bMajor) {
    return 1;
  }
}

export function compareMinorVersions(aVer, bVer) {
  if (aVer === bVer) {
    return 0;
  }
  const unstableVersionRegexp = /0-(alpha|beta|rc)(\d+)/;
  const aUnstableResult = aVer.match(unstableVersionRegexp);
  const bUnstableResult = bVer.match(unstableVersionRegexp);
  if (!aUnstableResult && !bUnstableResult) {
    const aInt = Number.parseInt(aVer);
    const bInt = Number.parseInt(bVer);
    if (Number.isNaN(aInt) || Number.isNaN(bInt)) {
      console.error('compareMinorVersions: invalid version string');
      return -1;
    }
    return Number.parseInt(aVer) - Number.parseInt(bVer);
  } else if (aUnstableResult && bUnstableResult) {
    if (aUnstableResult[1] === bUnstableResult[1]) {
      if (aUnstableResult[2] === bUnstableResult[2]) {
        return 0;
      } else if (
        Number.parseInt(aUnstableResult[2]) > Number.parseInt(bUnstableResult[2])
      ) {
        return 1;
      } else {
        return -1;
      }
    } else if (aUnstableResult[1] > bUnstableResult[1]) {
      return 1;
    } else {
      return -1;
    }
  } else if (!aUnstableResult && bUnstableResult) {
    return 1;
  } else if (aUnstableResult && !bUnstableResult) {
    return -1;
  }
}
