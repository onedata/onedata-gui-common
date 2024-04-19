/**
 * Contains type definitions related to "group" automation data spec.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { typeDefinitionBase } from './commons';

/**
 * @typedef {Object} AtmGroupDataSpec
 * @property {'group'} type
 * @property {Array<GroupAttribute> | null} attributes
 */

/**
 * @type {AtmDataSpecTypeDefinition<AtmGroupDataSpec, null>}
 */
export const atmDataSpecTypeDefinition = Object.freeze({
  ...typeDefinitionBase,
  supertype: 'object',
  getDefaultValue() {
    return {
      groupId: '',
    };
  },
});
