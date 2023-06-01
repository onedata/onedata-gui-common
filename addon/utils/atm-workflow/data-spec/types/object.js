/**
 * Contains type definitions related to "object" automation data spec.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { typeDefinitionBase } from './commons';

/**
 * @typedef {Object} AtmObjectDataSpec
 * @property {'object'} type
 */

/**
 * @type {AtmDataSpecTypeDefinition<AtmObjectDataSpec, null>}
 */
export const atmDataSpecTypeDefinition = Object.freeze({
  ...typeDefinitionBase,
  getDefaultValue() {
    return {};
  },
});
