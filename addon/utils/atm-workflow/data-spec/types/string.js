/**
 * Contains type definitions related to "string" automation data spec.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { typeDefinitionBase } from './commons';

/**
 * @typedef {Object} AtmStringDataSpec
 * @property {'string'} type
 * @property {AtmStringValueConstraints} valueConstraints
 */

/**
 * @typedef {Object} AtmStringValueConstraints
 * @property {Array<string>|null} [allowedValues]
 */

/**
 * @type {AtmDataSpecTypeDefinition<AtmStringValueConstraints, null>}
 */
export const atmDataSpecTypeDefinition = Object.freeze({
  ...typeDefinitionBase,
  getDefaultValue(atmDataSpec) {
    const allowedValues = atmDataSpec?.valueConstraints?.allowedValues;
    return (!allowedValues?.length || allowedValues?.includes('')) ? '' : allowedValues[0];
  },
});
