/**
 * Exports `createTaskResourcesFields` function, which is responsible for generating
 * "task resources"-related fields: cpu, memory and epheremal storage values.
 * Is extracted as a separate function due to multiple usages (in lambda form,
 * task form, etc.).
 *
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import NumberField from 'onedata-gui-common/utils/form-component/number-field';
import CapacityField from 'onedata-gui-common/utils/form-component/capacity-field';
import FormFieldsGroup from 'onedata-gui-common/utils/form-component/form-fields-group';
import StaticTextField from 'onedata-gui-common/utils/form-component/static-text-field';
import { get } from '@ember/object';
import {
  not,
  and,
  raw,
  eq,
  conditional,
  gte,
  or,
  math,
} from 'ember-awesome-macros';

/**
 * @typedef {Object} AtmResourceSpec
 * @property {Number} cpuRequested
 * @property {Number|null} cpuLimit
 * @property {Number} memoryRequested
 * @property {Number|null} memoryLimit
 * @property {Number} ephemeralStorageRequested
 * @property {Number|null} ephemeralStorageLimit
 */

/**
 * @param {String} spec.pathToGroup form path to group containing created fields
 * @param {Object} spec.cpuRequestedDefaultValueMixin mixin providing `defaultValue`
 * for requested cpu field
 * @param {Object} spec.cpuLimitDefaultValueMixin mixin providing `defaultValue`
 * for limit cpu field
 * @param {Object} spec.memoryRequestedDefaultValueMixin mixin providing `defaultValue`
 * for requested memory field
 * @param {Object} spec.memoryLimitDefaultValueMixin mixin providing `defaultValue`
 * for limit memory field
 * @param {Object} spec.ephemeralStorageRequestedDefaultValueMixin mixin providing `defaultValue`
 * for requested ephemeral storage field
 * @param {Object} spec.ephemeralStoragLimitDefaultValueMixin mixin providing `defaultValue`
 * for limit ephemeral storage field
 * @returns {Array<FormComponent.FormFieldsGroup>} array to be used inside `field` property
 * of some parent group
 */
export function createTaskResourcesFields({
  pathToGroup,
  cpuRequestedDefaultValueMixin,
  cpuLimitDefaultValueMixin,
  memoryRequestedDefaultValueMixin,
  memoryLimitDefaultValueMixin,
  ephemeralStorageRequestedDefaultValueMixin,
  ephemeralStorageLimitDefaultValueMixin,
}) {
  return [
    createTaskResourcesFieldsSubgroup({
      pathToGroup,
      resourceName: 'cpu',
      fieldClass: NumberField,
      requestedDefaultValueMixin: cpuRequestedDefaultValueMixin,
      limitDefaultValueMixin: cpuLimitDefaultValueMixin,
    }),
    createTaskResourcesFieldsSubgroup({
      pathToGroup,
      resourceName: 'memory',
      fieldClass: CapacityField,
      requestedDefaultValueMixin: memoryRequestedDefaultValueMixin,
      limitDefaultValueMixin: memoryLimitDefaultValueMixin,
      additionalFieldProps: {
        allowedUnits: ['MiB', 'GiB'],
      },
    }),
    createTaskResourcesFieldsSubgroup({
      pathToGroup,
      resourceName: 'ephemeralStorage',
      fieldClass: CapacityField,
      requestedDefaultValueMixin: ephemeralStorageRequestedDefaultValueMixin,
      limitDefaultValueMixin: ephemeralStorageLimitDefaultValueMixin,
      requestedValueComparatorToZero: 'gte',
      additionalFieldProps: {
        allowedUnits: ['MiB', 'GiB', 'TiB'],
      },
    }),
  ];
}

function createTaskResourcesFieldsSubgroup({
  pathToGroup,
  resourceName,
  fieldClass,
  requestedDefaultValueMixin = {},
  limitDefaultValueMixin = {},
  requestedValueComparatorToZero = 'gt',
  additionalFieldProps = {},
}) {
  const requiredValuePath = `valuesSource.${pathToGroup}.${resourceName}.${resourceName}Requested`;
  const limitValuePath = `valuesSource.${pathToGroup}.${resourceName}.${resourceName}Limit`;
  return FormFieldsGroup.create({
    name: resourceName,
    classes: 'resource-section',
    fields: [
      fieldClass
      .extend(requestedDefaultValueMixin, {
        lte: conditional(gte(limitValuePath, raw(0)), limitValuePath, raw(undefined)),
      })
      .create(Object.assign({
        name: `${resourceName}Requested`,
        [requestedValueComparatorToZero]: 0,
      }), additionalFieldProps),
      fieldClass
      .extend(limitDefaultValueMixin, {
        isVisible: not(and('isInViewMode', eq('value', raw(null)))),
        // using `or` because math.max can return NaN in some cases
        gte: or(math.max(requiredValuePath, raw(0)), raw(0)),
      })
      .create(Object.assign({
        name: `${resourceName}Limit`,
        isOptional: true,
      }), additionalFieldProps),
      StaticTextField.extend({
        isVisible: and('isInViewMode', eq(limitValuePath, raw(null))),
      }).create({
        name: `${resourceName}LimitUnlimitedDesc`,
      }),
    ],
  });
}

/**
 * Converts form fields values to a format compatible with backend
 * @param {Object} parentGroupValue value of resource fields parent group
 * @returns {Object}
 */
export function serializeTaskResourcesFieldsValues(parentGroupValue) {
  return {
    cpuRequested: serializeResourceValue(
      get(parentGroupValue || {}, 'cpu.cpuRequested')
    ),
    cpuLimit: serializeResourceValue(
      get(parentGroupValue || {}, 'cpu.cpuLimit')
    ),
    memoryRequested: serializeResourceValue(
      get(parentGroupValue || {}, 'memory.memoryRequested')
    ),
    memoryLimit: serializeResourceValue(
      get(parentGroupValue || {}, 'memory.memoryLimit')
    ),
    ephemeralStorageRequested: serializeResourceValue(
      get(parentGroupValue || {}, 'ephemeralStorage.ephemeralStorageRequested')
    ),
    ephemeralStorageLimit: serializeResourceValue(
      get(parentGroupValue || {}, 'ephemeralStorage.ephemeralStorageLimit')
    ),
  };
}

function serializeResourceValue(value) {
  if (typeof value === 'number') {
    return value;
  } else if (typeof value === 'string' && value) {
    const parsedValue = parseFloat(value);
    return Number.isNaN(parsedValue) ? null : parsedValue;
  } else {
    return null;
  }
}
