/**
 * Contains type definitions related to "range" automation data spec.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { isAtmDataSpecMatchingFiltersGeneric } from './commons';

/**
 * @typedef {Object} AtmRangeDataSpec
 * @property {'range'} type
 * @property {AtmRangeValueConstraints} valueConstraints
 */

/**
 * @typedef {Object} AtmRangeValueConstraints
 */

/**
 * @type {AtmDataSpecTypeDefinition<AtmRangeValueConstraints, null>}
 */
export const atmDataSpecTypeDefinition = {
  superTypes: ['object'],
  canValueConstraintsContain() {
    return true;
  },
  getValueConstraintsConditions() {
    return null;
  },
  isMatchingFilters(atmDataSpec, filters, context) {
    return isAtmDataSpecMatchingFiltersGeneric(atmDataSpec, filters, context);
  },
};
