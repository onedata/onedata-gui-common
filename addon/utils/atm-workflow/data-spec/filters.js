/**
 * Contains typedefs and functions related to automation data specs filters.
 *
 * Filters allow to check wheather or not some dataspec fulfills specific conditions
 * like being a subtype of some type.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/**
 * @typedef {Object} AtmDataSpecSupertypeFilter Only types which are equal or are supertype (parent type)
 * of one of the types in `types` fulfills this filter. Examples:
 * To check is integer and filter.types is [integer] -> ok (the same type)
 * To check is object and filter.types is [file] -> ok (object is a supertype of file)
 * To check is range and filter.types is [object] -> not ok (range is not a supertype of object)
 * To check is range and filter.types is [object,range] -> ok (range fits to one of the types in the filter)
 * @property {'typeOrSupertype'} filterType
 * @property {Array<AtmDataSpec>} types
 */

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
 * @typedef {Object} AtmDataSpecForbiddenFilter Only types which are different
 * than forbidden types fulfills this filter. Examples:
 * To check is integer and filter.forbiddenTypes is [integer] -> not ok
 * To check is file and filter.forbiddenTypes is [object] -> ok (file is not directly forbidden)
 * To check is object and filter.types is [range,object] -> not ok (object is present in the forbidden list)
 * @property {'forbiddenType'} filterType
 * @property {Array<AtmLeafDataSpec>} forbiddenTypes
 * @property {Array<AtmDataSpecPlacementContext>} ignoredContexts if provided,
 * allows to turn off this filter in some circumstances. E.g. when set to `root`
 * it means, that at the top level of the data spec it is possible to use types
 * from `forbiddenTypes`, but it is still not allowed to use them at any nested level.
 */

/**
 * @typedef {'root'|'array'|'default'} AtmDataSpecPlacementContext
 * Describes where data spec is placed. "root" means that it is not a nested part
 * of some broader data spec, "array" means that this data spec describes an array
 * item. For all other use cases, "default" should be used.
 */

/**
 * @typedef {
 *   AtmDataSpecSupertypeFilter |
 *   AtmDataSpecSubtypeFilter |
 *   AtmDataSpecForbiddenFilter
 * } AtmDataSpecFilter
 */

import { canDataSpecContain } from './types';

/**
 * Returns true when passed `dataSpec` fulfills all given `filters`.
 * @param {AtmDataSpec} dataSpec
 * @param {Array<AtmDataSpecFilter>} filters
 * @param {AtmDataSpecPlacementContext} [placementContext]
 * @returns {boolean}
 */
export function dataSpecMatchesFilters(dataSpec, filters, placementContext = 'root') {
  const dataSpecType = dataSpec?.type;
  // Absence of `dataSpec.type` means, that data spec is not complete (probably under
  // edition). It's emptiness does not directly violate any filter as there is still
  // posibbility that at some point this empty slot will be filled with a proper type.
  if (!dataSpecType || !filters?.length) {
    return true;
  }

  for (const filter of (filters || [])) {
    switch (filter.filterType) {
      case 'typeOrSupertype': {
        let thisFilterRejects = true;
        for (const filteredType of filter.types) {
          if (filteredType && canDataSpecContain(dataSpec, filteredType, true)) {
            thisFilterRejects = false;
          }
        }
        if (thisFilterRejects) {
          return false;
        }
        break;
      }
      case 'typeOrSubtype': {
        let thisFilterRejects = true;
        for (const filteredType of filter.types) {
          if (filteredType && canDataSpecContain(filteredType, dataSpec, true)) {
            thisFilterRejects = false;
          }
        }
        if (thisFilterRejects) {
          return false;
        }
        break;
      }
      case 'forbiddenType': {
        if (filter.ignoredContexts?.includes(placementContext)) {
          break;
        }
        for (const filteredType of filter.forbiddenTypes) {
          if (filteredType.type && dataSpecType === filteredType.type) {
            return false;
          }
        }
        break;
      }
    }
  }

  if (dataSpecType === 'array') {
    const itemDataSpec = dataSpec?.valueConstraints?.itemDataSpec;
    const itemFilters = [];

    for (const filter of filters) {
      switch (filter.filterType) {
        case 'typeOrSupertype':
        case 'typeOrSubtype': {
          // Any filters of the above types check all levels of nesting out of
          // the box (see `canDataSpecContain`) and we don't have to pass them deeper.
          break;
        }
        case 'forbiddenType':
          itemFilters.push(filter);
          break;
      }
    }

    return dataSpecMatchesFilters(itemDataSpec, itemFilters, 'array');
  }

  return true;
}
