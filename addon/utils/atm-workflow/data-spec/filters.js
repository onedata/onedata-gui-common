/**
 * @typedef {Object} DataSpecSupertypeFilter
 * @property {'typeOrSupertype'} filterType
 * @property {Array<AtmDataSpec>} types
 */

/**
 * @typedef {Object} DataSpecSubtypeFilter
 * @property {'typeOrSubtype'} filterType
 * @property {Array<AtmDataSpec>} types
 */

/**
 * @typedef {Object} DataSpecForbiddenFilter
 * @property {'forbiddenType'} filterType
 * @property {Array<AtmLeafDataSpec>} forbiddenTypes
 * @property {Array<DataSpecPlacementContext>} ignoredContexts
 */

/**
 * @typedef {'root'|'array'} DataSpecPlacementContext
 */

/**
 * @typedef {
 *   DataSpecSupertypeFilter |
 *   DataSpecSubtypeFilter |
 *   DataSpecForbiddenFilter
 * } DataSpecFilter
 */

import { get } from '@ember/object';
import { canDataSpecContain } from './types';

export function dataSpecMatchesFilters(dataSpec, filters, placementContext = 'root') {
  const dataSpecType = dataSpec && dataSpec.type;
  // Absence of `dataSpec.type` means, that data spec is not complete (probably under
  // edition). It's emptiness does not directly violate any filter as there is still
  // posibbility that at some point this empty slot will be filled with a proper type.
  if (!dataSpecType || !filters || !filters.length) {
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
        if ((filter.ignoredContexts || []).includes(placementContext)) {
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
    const itemDataSpec = get(dataSpec, 'valueConstraints.itemDataSpec');
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
