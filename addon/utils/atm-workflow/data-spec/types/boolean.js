/**
 * Contains type definitions related to "boolean" automation data spec.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { typeDefinitionBase } from './commons';

/**
 * @typedef {Object} AtmBooleanDataSpec
 * @property {'boolean'} type
 * @property {AtmBooleanValueConstraints} valueConstraints
 */

/**
 * @typedef {Object} AtmBooleanValueConstraints
 */

/**
 * @type {AtmDataSpecTypeDefinition<AtmBooleanValueConstraints, null>}
 */
export const atmDataSpecTypeDefinition = Object.freeze({
  ...typeDefinitionBase,
  getDefaultValue() {
    return false;
  },
});
