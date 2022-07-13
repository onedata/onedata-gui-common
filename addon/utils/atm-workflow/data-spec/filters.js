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
 * @typedef {Object} AtmDataSpecSupertypeFilter
 * @property {'typeOrSupertype'} filterType
 * @property {Array<AtmDataSpec>} types
 */

/**
 * @typedef {Object} AtmDataSpecSubtypeFilter
 * @property {'typeOrSubtype'} filterType
 * @property {Array<AtmDataSpec>} types
 */

/**
 * @typedef {Object} AtmDataSpecForbiddenFilter
 * @property {'forbiddenType'} filterType
 * @property {Array<AtmLeafDataSpec>} forbiddenTypes
 * @property {Array<AtmDataSpecPlacementContext>} ignoredContexts
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
