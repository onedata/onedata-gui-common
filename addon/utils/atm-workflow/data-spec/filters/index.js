/**
 * Aggregates functions dedicated for each data spec filter.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import _ from 'lodash';
import typeOrSupertypeFilterDefinition from './type-or-supertype';
import typeOrSubtypeFilterDefinition from './type-or-subtype';
import forbiddenTypeFilterDefinition from './forbidden-type';
import { atmDataSpecTypesArray, isAtmDataSpecCompatible, atmDataSpecTypeDefinitions } from '../types';

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
 * @property {(atmDataSpec: AtmDataSpec, filter: T, context: DoesAtmDataSpecMatchFilterFuncCtx)} doesAtmDataSpecMatchFilter
 */

/**
 * @typedef {Object} DoesAtmDataSpecMatchFilterFuncCtx
 * @property {(containerAtmDataSpec: AtmDataSpec, toContainAtmDataSpec: AtmDataSpec, ignoreEmpty: boolean) => boolean} isAtmDataSpecCompatible
 */

const atmDataSpecFilterDefinitionsMap = Object.freeze({
  typeOrSupertype: typeOrSupertypeFilterDefinition,
  typeOrSubtype: typeOrSubtypeFilterDefinition,
  forbiddenType: forbiddenTypeFilterDefinition,
});

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
  return allowedDataSpecTypesPerFilter.length ?
    _.intersection(...allowedDataSpecTypesPerFilter) : atmDataSpecTypesArray;
}

/**
 * @param {AtmDataSpecType} atmDataSpec
 * @param {Array<AtmDataSpecFilter>} filters
 * @returns {boolean}
 */
export function isAtmDataSpecMatchingFilters(atmDataSpec, filters) {
  const context = {
    doesAtmDataSpecMatchFilters: (...args) => doesAtmDataSpecMatchFilters(...args, {
      isAtmDataSpecCompatible,
      isAtmDataSpecMatchingFilters,
    }),
  };
  return atmDataSpecTypeDefinitions[atmDataSpec?.type]
    ?.isMatchingFilters?.(atmDataSpec, filters, context) ?? null;
}

/**
 * @param {AtmDataSpec} atmDataSpec
 * @param {Array<AtmDataSpecFilter>} filters
 * @param {DoesAtmDataSpecMatchFilterFuncCtx} context
 * @returns {boolean}
 */
function doesAtmDataSpecMatchFilters(atmDataSpec, filters, context) {
  // Absence of `atmDataSpec.type` means, that data spec is not complete (probably under
  // edition). It's emptiness does not directly violate any filter as there is still
  // posibbility that at some point this empty slot will be filled with a proper type.
  if (!atmDataSpec?.type || !filters?.length) {
    return true;
  }

  for (const filter of filters) {
    const checkFilterCallback = atmDataSpecFilterDefinitionsMap[filter?.filterType]
      .doesAtmDataSpecMatchFilter;
    if (!checkFilterCallback) {
      continue;
    }
    if (!checkFilterCallback(atmDataSpec, filter, context)) {
      return false;
    }
  }

  return true;
}
