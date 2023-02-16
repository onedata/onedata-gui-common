/**
 * Contains types, data and function related to "range" automation store.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { AtmDataSpecType } from 'onedata-gui-common/utils/atm-workflow/data-spec/types';

/**
 * @typedef {Object} AtmRangeStoreConfig
 */

/**
 * @returns {AtmDataSpec}
 */
export function getDefaultValueDataSpec() {
  return {
    type: AtmDataSpecType.Range,
  };
}

/**
 * @returns {Array<AtmDataSpecFilter>}
 */
export function getReadDataSpecFilters() {
  return [{
    filterType: 'typeOrSupertype',
    types: [{ type: 'range' }],
  }];
}

/**
 * @returns {Array<AtmDataSpecFilter>}
 */
export function getWriteDataSpecFilters() {
  return [{
    filterType: 'typeOrSubtype',
    types: [{ type: 'range' }],
  }];
}

export default {
  getDefaultValueDataSpec,
  getReadDataSpecFilters,
  getWriteDataSpecFilters,
};
