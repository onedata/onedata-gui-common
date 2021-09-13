/**
 * Exports `createTaskResourcesFields` function, which is responsible for generating
 * "task resources"-related fields: cpu, memory and epheremal storage values.
 * Is extracted as a separate function due to multiple usages (in lambda form,
 * task form, etc.).
 *
 * @module utils/workflow-visualiser/create-task-resources-fields
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import NumberField from 'onedata-gui-common/utils/form-component/number-field';
import CapacityField from 'onedata-gui-common/utils/form-component/capacity-field';
import FormFieldsGroup from 'onedata-gui-common/utils/form-component/form-fields-group';
import StaticTextField from 'onedata-gui-common/utils/form-component/static-text-field';
import { reads } from '@ember/object/computed';
import { not, and, raw, eq } from 'ember-awesome-macros';

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
 * for limit ephemeral storag field
 * @returns {Array<FormComponent.FormFieldsGroup>} array to be used inside `field` property
 * of some parent group
 */
export default function createTaskResourcesFields({
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
  requestedDefaultValueMixin,
  limitDefaultValueMixin,
  requestedValueComparatorToZero = 'gt',
  additionalFieldProps = {},
}) {
  const requiredValuePath = `valuesSource.${pathToGroup}.${resourceName}.${resourceName}Requested`;
  const limitValuePath = `valuesSource.${pathToGroup}.${resourceName}.${resourceName}Limit`;
  return FormFieldsGroup.create({
    name: resourceName,
    fields: [
      fieldClass
      .extend(requestedDefaultValueMixin, {
        lte: reads(limitValuePath),
      })
      .create(Object.assign({
        name: `${resourceName}Requested`,
        [requestedValueComparatorToZero]: 0,
      }), additionalFieldProps),
      fieldClass
      .extend(limitDefaultValueMixin, {
        isVisible: not(and('isInViewMode', eq('value', raw(null)))),
        gte: reads(requiredValuePath),
      })
      .create(Object.assign({
        name: `${resourceName}Limit`,
        isOptional: true,
      }), additionalFieldProps),
      StaticTextField.extend({
        isVisible: and('isInViewMode', eq(limitValuePath, raw(null))),
      }).create({
        name: `${resourceName}LimitDesc`,
      }),
    ],
  });
}
