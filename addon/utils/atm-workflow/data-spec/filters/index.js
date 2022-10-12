import _ from 'lodash';
import typeOrSupertypeFilterDefinition from './type-or-supertype';
import typeOrSubtypeFilterDefinition from './type-or-subtype';
import forbiddenTypeFilterDefinition from './forbidden-type';

/**
 * @typedef {
 *   AtmDataSpecSupertypeFilter |
 *   AtmDataSpecSubtypeFilter |
 *   AtmDataSpecForbiddenFilter
 * } AtmDataSpecFilter
 */

/**
 * @typedef {Object} AtmDataSpecFilterDefinition<T>
 * @property {(filter: T) => Array<AtmDataSpecType>} getMatchingAtmDataSpecTypes
 */

const atmDataSpecFilterDefinitionsMap = {
  typeOrSupertype: typeOrSupertypeFilterDefinition,
  typeOrSubtype: typeOrSubtypeFilterDefinition,
  forbiddenType: forbiddenTypeFilterDefinition,
};

/**
 * @param {Array<AtmDataSpecFilter>} filters
 * @returns {Array<AtmDataSpecType>}
 */
export function getMatchingAtmDataSpecTypes(filters) {
  const allowedDataSpecTypesPerFilter = filters
    ?.filter((filter) => filter?.filterType in atmDataSpecFilterDefinitionsMap)
    ?.map((filter) =>
      atmDataSpecFilterDefinitionsMap[filter.filterType]
      .getMatchingAtmDataSpecTypes(filter)
    ) ?? [];
  return _.intersection(...allowedDataSpecTypesPerFilter);
}
