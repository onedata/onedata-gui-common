/**
 * Contains definitions commonly used in Atm data types.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/**
 * @type {AtmDataSpecTypeDefinition<unknown, null>}
 */
export const typeDefinitionBase = Object.freeze({
  supertype: '',
  isValueConstraintsCompatible() {
    return true;
  },
  getValueConstraintsConditions() {
    return null;
  },
  isValueConstraintsMatchingFilters() {
    return true;
  },
});
