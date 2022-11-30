/**
 * Contains type definitions related to "integer" automation data spec.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { typeDefinitionBase } from './commons';

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
export const atmDataSpecTypeDefinition = typeDefinitionBase;
