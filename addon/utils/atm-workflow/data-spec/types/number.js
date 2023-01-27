/**
 * Contains type definitions related to "number" automation data spec.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { typeDefinitionBase } from './commons';

/**
 * @typedef {Object} AtmNumberDataSpec
 * @property {'number'} type
 * @property {AtmNumberValueConstraints} valueConstraints
 */

/**
 * @typedef {Object} AtmNumberValueConstraints
 */

/**
 * @type {AtmDataSpecTypeDefinition<AtmNumberValueConstraints, null>}
 */
export const atmDataSpecTypeDefinition = typeDefinitionBase;
