/**
 * Provides class with method for generating custom hash for fingerprinting filenames in
 * Broccoli pipeline (broccoli-assets-rev).
 *
 * The custom hash is necessary at least for vendor.js, because when vendor.js hash is
 * generated and its fingerprint is set, the assetsMap is generated with its fingerprinted
 * name (which by default bases on file content). Then the vendor.js content is altered,
 * because the `assetsMap-<fingerprint>.json` reference is added. The fingerprint in the
 * vendor.js filename is still the same, based on the non-actual content.
 *
 * The vendor.js in index.html of the application has an integrity check basing on the
 * actual content SHA, so no other file could be used. The problem is, when there are no
 * changes between two releases in onedata-gui-common (whose code is in the vendor.js),
 * the vendor.js has no changes beside the assetsMap fingerprint. In this case, we get
 * vendor.js with the old fingerprint filename, but with with new content.
 *
 * The web browser in production typically uses cache basing only on filename, so it will
 * not fetch new file, but the old, and the integrity check will fail.
 *
 * @author Jakub Liput
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/* eslint-env node */

const crypto = require('crypto');
const { execSync } = require('child_process');

/**
 * @param {Buffer} buf
 * @returns {string}
 */
function md5Hash(buf) {
  const md5 = crypto.createHash('md5');
  md5.update(buf);
  return md5.digest('hex');
}

function getCurrentGitRevShort() {
  return execSync('git rev-parse HEAD').toString().trim().slice(0, 8);
}

/**
 * @typedef {'onezone-gui'|'onepanel-gui'|'oneprovider-gui'} ProjectName
 */

class CustomBroccoliHasher {
  /**
   * @param {ProjectName} projectName
   */
  constructor(projectName) {
    /** @type {ProjectName} */
    this.projectName = projectName;
    /** @type {string} */
    this.currentGitRev = getCurrentGitRevShort();
  }

  /**
   * Uses the default hash for fingerprint for Broccoli (which is purely content-based MD5
   * sum) or adds short current git revision, which guarantees that browser will fetch the
   * file for each revision without caching.
   *
   * Should be used in `ember-cli-build.js` like this (example for onezone-gui):
   * ```js
   * const customBroccoliHash = new CustomBroccoliHasher('onezone-gui');
   * const app = new EmberApp(defaults, {
   *   // ...
   *   fingerprint: {
   *     // ...
   *     customHash: customBroccoliHasher.hash.bind(customBroccoliHasher),
   *   }
   * };
   * ```
   * @param {Buffer} buffer Content of file.
   * @param {string} pathToFile Absolute path to file in tmp dir of Broccoli.
   * @returns {string}
   */
  hash(buffer, pathToFile) {
    const md5 = md5Hash(buffer);
    if (this.isCustomFingerprintedPath(pathToFile)) {
      return `${md5}-${this.currentGitRev}`;
    } else {
      return md5;
    }
  }

  /**
   * True, if custom, not the default md5-based, fingerprint should be used as filename
   * hash.
   * @param {string} path
   * @returns {boolean}
   */
  isCustomFingerprintedPath(path) {
    if (!path) {
      return false;
    }
    return (
      // See jsdoc of this function to understand why vendor.js should have custom
      // fingerprint.
      path.endsWith('assets/vendor.js') ||

      // Custom fingerprint for onezone-gui.js is not necessary (there are not known cases
      // when the default one will fail), but there are no drawbacks for using the custom
      // fingerprint. Adding it for safety.
      path.endsWith(`assets/${this.projectName}.js`)
    );
  }
}

module.exports = {
  CustomBroccoliHasher,
};
