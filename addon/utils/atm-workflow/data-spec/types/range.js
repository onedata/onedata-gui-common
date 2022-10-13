/**
 * Contains type definitions related to "range" automation data spec.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { doesAtmDataSpecMatchFilters } from '../filters';

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
  supertype: 'object',
  canValueConstraintsContain() {
    return true;
  },
  getValueConstraintsConditions() {
    return null;
  },
  isMatchingFilters(atmDataSpec, filters, context) {
    return doesAtmDataSpecMatchFilters(atmDataSpec, filters, context);
  },
};
