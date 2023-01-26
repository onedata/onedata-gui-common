/**
 * Contains typedefs and functions specific for `typeOrSupertype` filter.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { atmDataSpecTypesArray, getAtmDataSpecTypeSupertypes } from '../types';

/**
 * @typedef {Object} AtmDataSpecSupertypeFilter Only types which are equal or
 * are supertype (parent type) of one of the types in `types` fulfills this
 * filter. Examples:
 * - To check is number and filter.types is [number] -> ok (the same type).
 * - To check is object and filter.types is [file] -> ok (object is a supertype
 * of file).
 * - To check is range and filter.types is [object] -> not ok (range is not
 * a supertype of object).
 * - To check is range and filter.types is [object,range] -> ok (range fits
 * to one of the types in the filter).
 * @property {'typeOrSupertype'} filterType
 * @property {Array<AtmDataSpec>} types
 */

/**
 * @type {AtmDataSpecFilterDefinition<AtmDataSpecSupertypeFilter>}
 */
export default Object.freeze({
  getMatchingAtmDataSpecTypes(filter) {
    const types = filter?.types;
    if (!types?.length) {
      return atmDataSpecTypesArray;
    }

    const allowedAtmDataSpecTypes = new Set();
    for (const dataSpec of types) {
      if (!atmDataSpecTypesArray.includes(dataSpec?.type)) {
        continue;
      }

      const newAllowedDataSpecTypes = [
        dataSpec.type,
        ...getAtmDataSpecTypeSupertypes(dataSpec.type),
      ];
      newAllowedDataSpecTypes.forEach((type) =>
        allowedAtmDataSpecTypes.add(type)
      );
    }

    return atmDataSpecTypesArray.filter((type) => allowedAtmDataSpecTypes.has(type));
  },
  doesAtmDataSpecMatchFilter(atmDataSpec, filter, context) {
    const filterTypes = filter?.types?.filter(Boolean) ?? [];
    for (const type of filterTypes) {
      if (context.isAtmDataSpecCompatible(atmDataSpec, type, true)) {
        return true;
      }
    }
    return filterTypes.length === 0;
  },
});
