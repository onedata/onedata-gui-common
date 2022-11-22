/**
 * Contains type definitions related to "array" automation data spec.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import _ from 'lodash';
import { doesAtmDataSpecMatchFilters } from '../filters';
import { typeDefinitionBase } from './commons';

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
export const atmDataSpecTypeDefinition = Object.freeze({
  ...typeDefinitionBase,
  isValueConstraintsCompatible(
    referenceConstraints,
    typeOrSubtypeConstraints,
    ignoreEmpty,
    context
  ) {
    if (!referenceConstraints?.itemDataSpec || !typeOrSubtypeConstraints?.itemDataSpec) {
      return ignoreEmpty;
    }

    return context.isAtmDataSpecCompatible(
      referenceConstraints.itemDataSpec,
      typeOrSubtypeConstraints.itemDataSpec,
      ignoreEmpty
    );
  },
  getValueConstraintsConditions(filters) {
    const itemDataSpecFilters = filters?.map((filter) => {
      const itemDataSpecs = filter?.types
        ?.map((dataSpec) =>
          dataSpec?.type === 'array' ? dataSpec?.valueConstraints?.itemDataSpec : null
        )
        ?.filter(Boolean) ?? [];
      switch (filter.filterType) {
        case 'typeOrSupertype':
        case 'typeOrSubtype': {
          return itemDataSpecs.length ? Object.assign({}, filter, {
            types: itemDataSpecs,
          }) : null;
        }
        case 'forbiddenType': {
          const newFilter = Object.assign({}, filter, {
            types: [...filter.types ?? []],
          });
          const typesToAppend = itemDataSpecs.filter((itemDataSpec) =>
            newFilter.types.every((dataSpec) => !_.isEqual(dataSpec, itemDataSpec))
          );
          newFilter.types.push(...typesToAppend);
          return newFilter;
        }
        default:
          return null;
      }
    }).filter(Boolean);

    return {
      itemDataSpecFilters,
    };
  },
  isMatchingFilters(atmDataSpec, filters, context) {
    if (!doesAtmDataSpecMatchFilters(atmDataSpec, filters, context)) {
      return false;
    }

    const itemDataSpec = atmDataSpec?.valueConstraints?.itemDataSpec;
    const filtersToCheck = filters?.filter((filter) =>
      filter?.filterType !== 'typeOrSupertype' &&
      filter?.filterType !== 'typeOrSubtype'
    );
    if (
      itemDataSpec &&
      !doesAtmDataSpecMatchFilters(itemDataSpec, filtersToCheck, context)
    ) {
      return false;
    }
    return true;
  },
});
