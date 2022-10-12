import { dataSpecTypes, getAtmDataSpecTypeSubtypes } from '../types';

/**
 * @typedef {Object} AtmDataSpecForbiddenFilter Only types which are different
 * than forbidden types fulfills this filter. Examples:
 * To check is integer and filter.types is [integer] -> not ok
 * To check is file and filter.types is [object] -> ok (file is not directly forbidden)
 * To check is object and filter.types is [range,object] -> not ok (object is present in the forbidden list)
 * @property {'forbiddenType'} filterType
 * @property {Array<AtmLeafDataSpec>} types
 * @property {Array<AtmDataSpecPlacementContext>} ignoredContexts if provided,
 * allows to turn off this filter in some circumstances. E.g. when set to `root`
 * it means, that at the top level of the data spec it is possible to use types
 * from `types`, but it is still not allowed to use them at any nested level.
 */

/**
 * @type {AtmDataSpecFilterDefinition<AtmDataSpecForbiddenFilter>}
 */
export default {
  getMatchingAtmDataSpecTypes(filter) {
    const types = filter?.types ?? [];
    if (!types.length) {
      return dataSpecTypes;
    }

    const forbiddenAtmDataSpecTypes = new Set();
    for (const dataSpec of types) {
      if (!dataSpecTypes.includes(dataSpec?.type)) {
        continue;
      }

      const newForbiddenDataSpecTypes = [
        dataSpec.type,
        ...getAtmDataSpecTypeSubtypes(dataSpec.type),
      ];
      newForbiddenDataSpecTypes.forEach((type) =>
        forbiddenAtmDataSpecTypes.add(type)
      );
    }

    return dataSpecTypes.filter((type) => !forbiddenAtmDataSpecTypes.has(type));
  },
};
