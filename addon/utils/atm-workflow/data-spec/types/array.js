/**
 * Contains type definitions related to "array" automation data spec.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import _ from 'lodash';
import { typeDefinitionBase } from './commons';

/**
 * @typedef {Object} AtmArrayDataSpec
 * @property {'array'} type
 * @property {AtmDataSpec} itemDataSpec
 */

/**
 * @typedef {Object} AtmArrayDataSpecParamsConditions
 * @property {Array<AtmDataSpecFilter>} itemDataSpecFilters
 */

/**
 * @type {AtmDataSpecTypeDefinition<AtmArrayDataSpec, AtmArrayDataSpecParamsConditions>}
 */
export const atmDataSpecTypeDefinition = Object.freeze({
  ...typeDefinitionBase,
  areAtmDataSpecParamsCompatible(
    referenceAtmDataSpec,
    typeOrSubtypeAtmDataSpec,
    ignoreEmpty,
    context
  ) {
    if (!referenceAtmDataSpec?.itemDataSpec || !typeOrSubtypeAtmDataSpec?.itemDataSpec) {
      return ignoreEmpty;
    }

    return context.isAtmDataSpecCompatible(
      referenceAtmDataSpec.itemDataSpec,
      typeOrSubtypeAtmDataSpec.itemDataSpec,
      ignoreEmpty
    );
  },
  getAtmDataSpecParamsConditions(filters) {
    const itemDataSpecFilters = filters?.map((filter) => {
      const itemDataSpecs = filter?.types
        ?.map((dataSpec) =>
          dataSpec?.type === 'array' ? dataSpec?.itemDataSpec : null
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
  isAtmDataSpecParamsMatchingFilters(atmDataSpec, atmDataSpecFilters, context) {
    const itemDataSpec = atmDataSpec?.itemDataSpec;
    const filtersToCheck = atmDataSpecFilters?.filter((filter) =>
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
  },
  getDefaultValue() {
    return [];
  },
});
