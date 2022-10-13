/**
 * Contains type definitions related to "integer" automation data spec.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { doesAtmDataSpecMatchFilters } from '../filters';

/**
 * @typedef {Object} AtmIntegerDataSpec
 * @property {'integer'} type
 * @property {AtmIntegerValueConstraints} valueConstraints
 */

/**
 * @typedef {Object} AtmIntegerValueConstraints
 */

/**
 * @type {AtmDataSpecTypeDefinition<AtmIntegerValueConstraints, null>}
 */
export const atmDataSpecTypeDefinition = {
  supertype: null,
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
