/**
 * Contains type definitions related to "number" automation data spec.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { typeDefinitionBase } from './commons';

/**
 * @typedef {Object} AtmNumberDataSpec
 * @property {'number'} type
 * @property {AtmNumberValueConstraints} valueConstraints
 */

/**
 * @typedef {Object} AtmNumberValueConstraints
 * @property {boolean} [integersOnly]
 * @property {Array<number>|null} [allowedValues]
 */

/**
 * @typedef {Object} AtmArrayValueConstraintsConditions
 * @property {Array<boolean>} integersOnlyConstraintValues
 */

/**
 * @type {AtmDataSpecTypeDefinition<AtmNumberValueConstraints, AtmArrayValueConstraintsConditions>}
 */
export const atmDataSpecTypeDefinition = Object.freeze({
  ...typeDefinitionBase,
  isValueConstraintsCompatible(
    referenceConstraints,
    typeOrSubtypeConstraints,
  ) {
    // `referenceConstraints` do not narrow values to integers or both
    // of constraints allow only integers.
    return !referenceConstraints?.integersOnly ||
      typeOrSubtypeConstraints?.integersOnly;
  },
  getValueConstraintsConditions(filters) {
    const integersOnlyConstraintForbiddenValues = new Set();
    filters?.forEach((filter) => {
      const integersOnlyConstraintFilterValues = filter?.types
        ?.map((dataSpec) =>
          dataSpec?.type === 'number' ?
          Boolean(dataSpec?.valueConstraints?.integersOnly) : null
        )
        ?.filter((value) => value !== null) ?? [];
      switch (filter.filterType) {
        case 'typeOrSupertype':
          if (integersOnlyConstraintFilterValues.includes(false)) {
            integersOnlyConstraintForbiddenValues.add(true);
          }
          break;
        case 'typeOrSubtype':
          if (integersOnlyConstraintFilterValues.includes(true)) {
            integersOnlyConstraintForbiddenValues.add(false);
          }
          break;
      }
    });

    const integersOnlyConstraintValues = [false, true].filter((value) =>
      !integersOnlyConstraintForbiddenValues.has(value)
    );

    return {
      integersOnlyConstraintValues,
    };
  },
  getDefaultValue(atmDataSpec) {
    const allowedValues = atmDataSpec?.valueConstraints?.allowedValues;
    return (!allowedValues?.length || allowedValues?.includes(0)) ? 0 : allowedValues[0];
  },
});
