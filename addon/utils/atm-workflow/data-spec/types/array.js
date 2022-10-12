/**
 * Contains type definitions related to "array" automation data spec.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { isAtmDataSpecMatchingFiltersGeneric } from './commons';

/**
 * @typedef {Object} AtmArrayDataSpec
 * @property {'array'} type
 * @property {AtmArrayValueConstraints} valueConstraints
 */

/**
 * @typedef {Object} AtmArrayValueConstraints
 * @property {AtmDataSpec} itemDataSpec
 */

/**
 * @typedef {Object} AtmArrayValueConstraintsConditions
 * @property {Array<AtmDataSpecFilter>} itemDataSpecFilters
 */

/**
 * @type {AtmDataSpecTypeDefinition<AtmArrayValueConstraints, AtmArrayValueConstraintsConditions>}
 */
export const atmDataSpecTypeDefinition = {
  superTypes: [],
  canValueConstraintsContain(
    containerConstraints,
    toContainConstraints,
    ignoreEmpty,
    context
  ) {
    if (!containerConstraints?.itemDataSpec || !toContainConstraints?.itemDataSpec) {
      return ignoreEmpty;
    }

    return context.canDataSpecContain(
      containerConstraints.itemDataSpec,
      toContainConstraints.itemDataSpec,
      ignoreEmpty
    );
  },
  getValueConstraintsConditions(filters) {
    const itemDataSpecFilters = filters?.map((filter) => {
      switch (filter.filterType) {
        case 'typeOrSupertype':
        case 'typeOrSubtype': {
          const itemDataSpecs = filter?.type
            ?.map((dataSpec) =>
              dataSpec?.type === 'array' ? dataSpec?.valueConstraints?.itemDataSpec : null
            )
            ?.filter(Boolean) ?? [];
          return itemDataSpecs.length ? Object.assign({}, filter, {
            types: itemDataSpecs,
          }) : null;
        }
        case 'forbiddenType':
          return filter;
        default:
          return null;
      }
    }).filter(Boolean);

    return {
      itemDataSpecFilters,
    };
  },
  isMatchingFilters(atmDataSpec, filters, context) {
    return isAtmDataSpecMatchingFiltersGeneric(
      atmDataSpec,
      filters,
      context,
      (atmDataSpec, filters, context) => {
        const itemDataSpec = atmDataSpec?.valueConstraints?.itemDataSpec;
        const filtersToCheck = filters?.filter((filter) =>
          filter?.filterType !== 'typeOrSupertype' &&
          filter?.filterType !== 'typeOrSubtype'
        );
        if (
          itemDataSpec &&
          !context.isAtmDataSpecMatchingFilters(itemDataSpec, filtersToCheck)
        ) {
          return false;
        }
        return true;
      }
    );
  },
};
