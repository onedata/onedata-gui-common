/**
 * Utilities to compare Onedata sevice versions
 *
 * @author Jakub Liput
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @copyright (C) 2025 Onedata (onedata.org)
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { compareVersions as compareSemanticVersions } from 'compare-versions';

export default {
  isRequiredVersion,
  compareVersions,
  semversionize,
};

/**
 * @param {string} version
 * @param {string} minVersion
 * @returns {boolean}
 */
export function isRequiredVersion(version, minVersion) {
  return compareVersions(version, minVersion) >= 0;
}

export function compareVersions(aVer, bVer) {
  return compareSemanticVersions(semversionize(aVer), semversionize(bVer));
}

/**
 * @param {string} version
 * @returns {string|null}
 */
export function semversionize(version) {
  if (!version) {
    return null;
  }
  const firstMajor = version.match(/^(\d+).*$/)?.[1];
  if (!firstMajor) {
    return null;
  }
  return firstMajor > 21 ?
    semversionizeCalVer(version) : semversionizeLegacy(version);
}

/**
 * @param {string} version
 * @returns {string}
 */
function semversionizeCalVer(version) {
  // Two-positional, e.g., 25.1
  const twoMatch = version.match(/^(\d+)\.(\d+)$/);
  if (twoMatch) {
    const major = twoMatch[1];
    const minor = twoMatch[2];
    return compileVersionString(major, minor);
  }

  // Three-positional, e.g., 25.1.2
  // It may contain string with tag on second or third position, e.g., 25.0-rc.1
  const threeMatch = version.match(/^(\d+)\.([^.]+?)\.(\d+)$/);
  if (threeMatch) {
    const major = threeMatch[1];
    let minor;
    let patch;
    let tagVersion;
    const initialMinor = threeMatch[2];
    // Version with regular minor, e.g., 25.0.1
    if (Number.isInteger(Number(initialMinor))) {
      minor = initialMinor;
      patch = threeMatch[3];
    } else {
      // Shortened tagged version, e.g., 25.1-rc.1 -> 25.1.0-rc.1
      const minorMatch = initialMinor.match(/^(\d)+(-(alpha|beta|rc))$/);
      if (minorMatch) {
        minor = minorMatch[1];
        patch = `0${minorMatch[2]}`;
        tagVersion = threeMatch[3];
      } else {
        return null;
      }
    }
    return compileVersionString(major, minor, patch, tagVersion);
  }

  // Full semver with version tag, e.g., 25.1.2-rc.3
  const fourMatch = version.match(/^(\d+)\.(\d+)\.(.+?)\.(\d+)$/);
  if (fourMatch) {
    return compileVersionString(
      fourMatch[1],
      fourMatch[2],
      fourMatch[3],
      fourMatch[4]
    );
  }

  // No known pattern for the provided version.
  return null;
}

/**
 * @param {string} version
 * @returns {string}
 */
function semversionizeLegacy(version) {
  const legacyVersionData = parseLegacyVersion(version);
  if (!legacyVersionData) {
    return null;
  }
  const { major: legacyMajor, minor: legacyMinor } = legacyVersionData;
  const majorMatch = legacyMajor.match(/^(\d+)\.(\d+)$/);
  if (!majorMatch) {
    return null;
  }
  const major = majorMatch[1];
  const minor = Number(majorMatch[2]);
  let patch;
  let tagVersion;
  if (/^\d+$/.test(legacyMinor)) {
    patch = legacyMinor;
  } else {
    const minorMatch = legacyMinor.match(/^(\d+-(rc|beta|alpha))(\d+)$/);
    if (!minorMatch) {
      return null;
    }
    patch = minorMatch[1];
    tagVersion = minorMatch[3];
  }
  return compileVersionString(major, minor, patch, tagVersion);
}

function parseLegacyVersion(version) {
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

/**
 * @param {string} major
 * @param {string} minor
 * @param {string} [patch]
 * @param {string} [tagVersion]
 * @returns {string}
 */
function compileVersionString(major, minor, patch, tagVersion) {
  let resultVersion = `${major}.${minor}.${patch ?? 0}`;
  if (tagVersion) {
    resultVersion += `.${tagVersion}`;
  }
  return resultVersion;
}
