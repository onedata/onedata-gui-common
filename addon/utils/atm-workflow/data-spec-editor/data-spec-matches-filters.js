import { get } from '@ember/object';
import {
  dataSpecSupertypes,
  dataSpecSubtypes,
} from 'onedata-gui-common/utils/atm-workflow/data-spec';

export default function dataSpecMatchesFilters(dataSpec, filters, placementContext) {
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
          if (
            filteredType.type && (
              dataSpecType === filteredType.type ||
              (dataSpecSupertypes[filteredType.type] || []).includes(dataSpecType)
            )
          ) {
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
          if (
            filteredType.type && (
              dataSpecType === filteredType.type ||
              (dataSpecSubtypes[filteredType.type] || []).includes(dataSpecType)
            )
          ) {
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
          const itemTypes = [];
          for (const type of filter.types) {
            if (type.type === 'array') {
              itemTypes.push(get(type, 'valueConstraints.itemDataSpec'));
            }
          }
          if (itemTypes.length) {
            itemFilters.push(Object.assign({}, filter, {
              types: itemTypes,
            }));
          }
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
