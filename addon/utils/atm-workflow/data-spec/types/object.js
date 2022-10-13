/**
 * Contains type definitions related to "object" automation data spec.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { doesAtmDataSpecMatchFilters } from '../filters';

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
