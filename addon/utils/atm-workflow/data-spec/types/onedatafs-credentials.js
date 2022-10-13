/**
 * Contains type definitions related to "onedatafs credentials" automation data spec.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { doesAtmDataSpecMatchFilters } from '../filters';

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
