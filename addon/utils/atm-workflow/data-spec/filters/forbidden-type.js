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
 * than all of provided forbidden types (and it's subtypes) fulfills this filter.
 * This also applies to any nested data type. Examples:
 * - To check is number and filter.types is [number] -> not ok.
 * - To check is file and filter.types is [object] -> not ok (every file is
 * also an object).
 * - To check is object and filter.types is [range,object] -> not ok (object is
 * present in the forbidden list).
 * - To check is object and filter.types is [file] -> ok (not every object
 * is a file).
 * - To check is an array of files and filter.types is [object] -> not ok(!)
 * (file is an object. It doesn't matter that it is nested inside an array).
 *
 * @property {'forbiddenType'} filterType
 * @property {Array<AtmDataSpec>} types
 */

/**
 * @type {AtmDataSpecFilterDefinition<AtmDataSpecForbiddenFilter>}
 */
export default Object.freeze({
  getMatchingAtmDataSpecTypes(filter) {
    const types = filter?.types;
    if (!types?.length) {
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
      if (context.isAtmDataSpecCompatible(type, atmDataSpec, true)) {
        return false;
      }
    }
    return true;
  },
});
