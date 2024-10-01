/**
 * Provides tools for generating URLs to Onedata homepage.
 *
 * @author Jakub Liput
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service, { inject as service } from '@ember/service';

export const documentationUrlPrefix = 'https://onedata.org/#/home/documentation';

const fallbackDocsVersion = 'stable';

/**
 * Simplifies version numer to the one that is used in onedata.org homepage for
 * documentation.
 * @param {string} version For example: '21.02.3'
 * @returns {string|undefined} For example: '21.02'. Returns undefined if version is in
 *   unknown format (also applies for special 'stable' version).
 */
function simplifyVersion(version) {
  return version.match(/(\d+\.\d+)\.\d+/)?.[1];
}

export default Service.extend({
  guiUtils: service(),

  /**
   * @param {Object} options
   * @param { string } [options.topic] Example generated URL for topic:
   *   https://onedata.org/#/home/documentation/topic/21.02/qos
   * @param {string} [options.version]
   * @param {string} [options.path] Provide path to documentation page suitable for the
   *   selected version.Typically you should not use this argument - use `topic` instead.
   *   If there is no topic for your page, consider adding it to homepage URL handler.
   *   If you use `path` the `topic` is ignored.
   * @returns {string}
   */
  generateDocumentationUrl({ topic, version, path }) {
    const effVersion = this.effVersion(version);
    if (path) {
      return `${documentationUrlPrefix}/${effVersion}/${path}`;
    }
    if (topic) {
      return `${documentationUrlPrefix}/topic/${effVersion}/${topic}`;
    }
  },

  /**
   * @param {string} [version] If provided - returns the simplified version string.
   *   If not provided - returns the simplified version string proper for the running
   *   version of the backend service (op-worker etc.)
   * @returns {string}
   */
  effVersion(version) {
    let effVersion = version;
    if (!effVersion) {
      effVersion = this.guiUtils.softwareVersionDetails?.serviceVersion;
    }
    if (effVersion) {
      effVersion = simplifyVersion(effVersion);
    }
    if (!effVersion) {
      effVersion = fallbackDocsVersion;
    }
    return effVersion;
  },
});
