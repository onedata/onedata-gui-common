/**
 * Contains typedefs and functions specific for `forbiddenType` filter.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { atmDataSpecTypesArray, getAtmDataSpecTypeSubtypes } from '../types';

/**
 * @typedef {Object} AtmDataSpecForbiddenFilter Only types which are different
 * than forbidden types fulfills this filter. Examples:
 * To check is integer and filter.types is [integer] -> not ok
 * To check is file and filter.types is [object] -> ok (file is not directly forbidden)
 * To check is object and filter.types is [range,object] -> not ok (object is present in the forbidden list)
 * @property {'forbiddenType'} filterType
 * @property {Array<AtmDataSpec>} types
 */

/**
 * @type {AtmDataSpecFilterDefinition<AtmDataSpecForbiddenFilter>}
 */
export default {
  getMatchingAtmDataSpecTypes(filter) {
    const types = filter?.types ?? [];
    if (!types.length) {
      return atmDataSpecTypesArray;
    }

    const forbiddenAtmDataSpecTypes = new Set();
    for (const dataSpec of types) {
      if (!atmDataSpecTypesArray.includes(dataSpec?.type)) {
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

    return atmDataSpecTypesArray.filter((type) => !forbiddenAtmDataSpecTypes.has(type));
  },
  doesAtmDataSpecMatchFilter(atmDataSpec, filter, context) {
    const filterTypes = filter?.types?.filter(Boolean) ?? [];
    for (const type of filterTypes) {
      if (context.canAtmDataSpecContain(type, atmDataSpec, true)) {
        return false;
      }
    }
    return true;
  },
};
