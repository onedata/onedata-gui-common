import { atmDataSpecTypesArray, getAtmDataSpecTypeSubtypes } from '../types';

/**
 * @typedef {Object} AtmDataSpecSubtypeFilter Only types which are equal or are subtypes (child type)
 * of one of the types in `types` fulfills this filter. Examples:
 * To check is integer and filter.types is [integer] -> ok (the same type)
 * To check is file and filter.types is [object] -> ok (file is a subtype of object)
 * To check is object and filter.types is [range] -> not ok (object is not a subtype of range)
 * To check is object and filter.types is [object,range] -> ok (object fits to one of the types in the filter)
 * @property {'typeOrSubtype'} filterType
 * @property {Array<AtmDataSpec>} types
 */

/**
 * @type {AtmDataSpecFilterDefinition<AtmDataSpecSubtypeFilter>}
 */
export default {
  getMatchingAtmDataSpecTypes(filter) {
    const types = filter?.types ?? [];
    if (!types.length) {
      return atmDataSpecTypesArray;
    }

    const allowedAtmDataSpecTypes = new Set();
    for (const dataSpec of types) {
      if (!atmDataSpecTypesArray.includes(dataSpec?.type)) {
        continue;
      }

      const newAllowedDataSpecTypes = [
        dataSpec.type,
        ...getAtmDataSpecTypeSubtypes(dataSpec.type),
      ];
      newAllowedDataSpecTypes.forEach((type) =>
        allowedAtmDataSpecTypes.add(type)
      );
    }

    return atmDataSpecTypesArray.filter((type) => allowedAtmDataSpecTypes.has(type));
  },
};
