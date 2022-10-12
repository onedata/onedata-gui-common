/**
 * Contains type definitions related to "object" automation data spec.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { isAtmDataSpecMatchingFiltersGeneric } from './commons';

/**
 * @typedef {Object} AtmObjectDataSpec
 * @property {'object'} type
 * @property {AtmObjectValueConstraints} valueConstraints
 */

/**
 * @typedef {Object} AtmObjectValueConstraints
 */

/**
 * @type {AtmDataSpecTypeDefinition<AtmObjectValueConstraints, null>}
 */
export const atmDataSpecTypeDefinition = {
  superTypes: [],
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
