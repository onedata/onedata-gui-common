/**
 * Contains type definitions related to "onedatafs credentials" automation data spec.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { isAtmDataSpecMatchingFiltersGeneric } from './commons';

/**
 * @typedef {Object} AtmOnedatafsCredentialsDataSpec
 * @property {'onedatafsCredentials'} type
 * @property {AtmOnedatafsCredentialsValueConstraints} valueConstraints
 */

/**
 * @typedef {Object} AtmOnedatafsCredentialsValueConstraints
 */

/**
 * @type {AtmDataSpecTypeDefinition<AtmOnedatafsCredentialsValueConstraints, null>}
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
