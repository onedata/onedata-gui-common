/**
 * Contains util functions related to datasets.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { getFileNameFromPath } from 'onedata-gui-common/utils/file';

/**
 * Returns dataset name calculated from it's root file path. If name cannot be
 * extracted, `null` is returned.
 * @param {string} rootFilePath
 * @returns {string|null}
 */
export function getDatasetNameFromRootFilePath(rootFilePath) {
  return getFileNameFromPath(rootFilePath);
}
