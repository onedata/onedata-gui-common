/**
 * @param {AtmDataSpec} atmDataSpec
 * @param {Array<AtmDataSpecFilter>} filters
 * @param {IsAtmDataSpecMatchingFiltersFunctionContext} context
 * @returns {boolean}
 */
function isAtmDataSpecMatchingTypeOrSupertypeFilter(atmDataSpec, filter, context) {
  const filterTypes = filter?.types?.filter(Boolean) ?? [];
  for (const type of filterTypes) {
    if (context.canDataSpecContain(atmDataSpec, type, true)) {
      return true;
    }
  }
  return filterTypes.length === 0;
}

/**
 * @param {AtmDataSpec} atmDataSpec
 * @param {Array<AtmDataSpecFilter>} filters
 * @param {IsAtmDataSpecMatchingFiltersFunctionContext} context
 * @returns {boolean}
 */
function isAtmDataSpecMatchingTypeOrSubtypeFilter(atmDataSpec, filter, context) {
  const filterTypes = filter?.types?.filter(Boolean) ?? [];
  for (const type of filterTypes) {
    if (context.canDataSpecContain(type, atmDataSpec, true)) {
      return true;
    }
  }
  return filterTypes.length === 0;
}

/**
 * @param {AtmDataSpec} atmDataSpec
 * @param {Array<AtmDataSpecFilter>} filters
 * @returns {boolean}
 */
function isAtmDataSpecMatchingForbiddenTypeFilter(atmDataSpec, filter, context) {
  const filterTypes = filter?.types?.filter(Boolean) ?? [];
  for (const type of filterTypes) {
    if (context.canDataSpecContain(type, atmDataSpec, true)) {
      return false;
    }
  }
  return true;
}

const filterCheckers = {
  typeOrSupertype: isAtmDataSpecMatchingTypeOrSupertypeFilter,
  typeOrSubtype: isAtmDataSpecMatchingTypeOrSubtypeFilter,
  forbiddenType: isAtmDataSpecMatchingForbiddenTypeFilter,
};

/**
 * @typedef {Object} IsAtmDataSpecMatchingFiltersGenericFunctionContext
 * @property {(containerDataSpec: AtmDataSpec, toContainDataSpec: AtmDataSpec, ignoreEmpty: boolean) => boolean} canDataSpecContain
 * @property {(atmDataSpec: AtmDataSpec, filters: Array<AtmDataSpecFilter>) => boolean} isAtmDataSpecMatchingFilters
 */

/**
 * @param {AtmDataSpec} atmDataSpec
 * @param {Array<AtmDataSpecFilter>} filters
 * @param {IsAtmDataSpecMatchingFiltersGenericFunctionContext} context
 * @param {(atmDataSpec: AtmDataSpec, filters: Array<AtmDataSpecFilter>, context: IsAtmDataSpecMatchingFiltersGenericFunctionContext) => boolean} [additionalCheckCallback]
 * @returns {boolean}
 */
export function isAtmDataSpecMatchingFiltersGeneric(
  atmDataSpec,
  filters,
  context,
  additionalCheckCallback
) {
  // Absence of `atmDataSpec.type` means, that data spec is not complete (probably under
  // edition). It's emptiness does not directly violate any filter as there is still
  // posibbility that at some point this empty slot will be filled with a proper type.
  if (!atmDataSpec?.type || !filters?.length) {
    return true;
  }

  for (const filter of filters) {
    const checkFilterCallback = filterCheckers[filter?.filterType];
    if (!checkFilterCallback) {
      continue;
    }
    if (!checkFilterCallback(atmDataSpec, filter, context)) {
      return false;
    }
  }

  if (typeof additionalCheckCallback === 'function') {
    return additionalCheckCallback(atmDataSpec, filters, context);
  }

  return true;
}
