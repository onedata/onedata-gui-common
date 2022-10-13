/**
 * Contains type definitions related to "dataset" automation data spec.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { doesAtmDataSpecMatchFilters } from '../filters';

/**
 * @typedef {Object} AtmDatasetDataSpec
 * @property {'dataset'} type
 * @property {AtmDatasetValueConstraints} valueConstraints
 */

/**
 * @typedef {Object} AtmDatasetValueConstraints
 */

/**
 * @type {AtmDataSpecTypeDefinition<AtmDatasetValueConstraints, null>}
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
