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
 * @property {boolean} [integersOnly]
 * @property {Array<number>|null} [allowedValues]
 */

/**
 * @typedef {Object} AtmNumberDataSpecParamsConditions
 * @property {Array<boolean>} integersOnlyParamValues
 */

/**
 * @type {AtmDataSpecTypeDefinition<AtmNumberDataSpec, AtmNumberDataSpecParamsConditions>}
 */
export const atmDataSpecTypeDefinition = Object.freeze({
  ...typeDefinitionBase,
  areAtmDataSpecParamsCompatible(
    referenceAtmDataSpec,
    typeOrSubtypeAtmDataSpec,
  ) {
    // `referenceAtmDataSpec` do not narrow values to integers or both
    // of specs allow only integers.
    return !referenceAtmDataSpec?.integersOnly ||
      typeOrSubtypeAtmDataSpec?.integersOnly;
  },
  getAtmDataSpecParamsConditions(filters) {
    const integersOnlyParamForbiddenValues = new Set();
    filters?.forEach((filter) => {
      const integersOnlyParamFilterValues = filter?.types
        ?.map((dataSpec) =>
          dataSpec?.type === 'number' ?
          Boolean(dataSpec?.integersOnly) : null
        )
        ?.filter((value) => value !== null) ?? [];
      switch (filter.filterType) {
        case 'typeOrSupertype':
          if (integersOnlyParamFilterValues.includes(false)) {
            integersOnlyParamForbiddenValues.add(true);
          }
          break;
        case 'typeOrSubtype':
          if (integersOnlyParamFilterValues.includes(true)) {
            integersOnlyParamForbiddenValues.add(false);
          }
          break;
      }
    });

    const integersOnlyParamValues = [false, true].filter((value) =>
      !integersOnlyParamForbiddenValues.has(value)
    );

    return {
      integersOnlyParamValues,
    };
  },
  getDefaultValue(atmDataSpec) {
    const allowedValues = atmDataSpec?.allowedValues;
    return (!allowedValues?.length || allowedValues?.includes(0)) ? 0 : allowedValues[0];
  },
});
