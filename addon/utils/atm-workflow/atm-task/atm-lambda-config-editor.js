/**
 * Atm lambda config editor. Suitable for editing atm lambda parameters inside
 * atm task schema form.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed, observer } from '@ember/object';
import { reads } from '@ember/object/computed';
import {
  eq,
  neq,
  raw,
  not,
  and,
  isEmpty,
} from 'ember-awesome-macros';
import _ from 'lodash';
import FormFieldsGroup from 'onedata-gui-common/utils/form-component/form-fields-group';
import FormFieldsCollectionGroup from 'onedata-gui-common/utils/form-component/form-fields-collection-group';
import DropdownField from 'onedata-gui-common/utils/form-component/dropdown-field';
import HiddenField from 'onedata-gui-common/utils/form-component/hidden-field';
import {
  ValueEditorField as AtmValueEditorField,
  rawValueToFormValue as atmRawValueToFormValue,
  formValueToRawValue as atmFormValueToRawValue,
} from 'onedata-gui-common/utils/atm-workflow/value-editors';
import { getDefaultValueForAtmDataSpec } from 'onedata-gui-common/utils/atm-workflow/data-spec/types';
import { createValuesContainer } from 'onedata-gui-common/utils/form-component/values-container';

/**
 * @typedef {'defaultValue' | 'customValue' | 'leaveUnassigned'} ParamValueBuilder
 *   Describes how parameter value will be constructed. This enum is only for
 *   GUI purposes and is not saved inside model.
 */

/**
 * @type {Object<string, ParamValueBuilder>}
 */
const ParamValueBuilder = Object.freeze({
  DefaultValue: 'defaultValue',
  CustomValue: 'customValue',
  LeaveUnassigned: 'leaveUnassigned',
});

/**
 * @type {Array<ParamValueBuilder>}
 */
const paramValueBuilderArray = Object.freeze([
  ParamValueBuilder.DefaultValue,
  ParamValueBuilder.CustomValue,
  ParamValueBuilder.LeaveUnassigned,
]);

export const AtmLambdaConfigEditor = FormFieldsCollectionGroup.extend({
  /**
   * @override
   */
  i18nPrefix: 'utils.atmWorkflow.atmTask.atmLambdaConfigEditor',

  /**
   * Do not take parent fields group translation path into account.
   * @override
   */
  translationPath: '',

  /**
   * @override
   */
  isVisible: not(and('isInViewMode', isEmpty('value.__fieldsValueNames'))),

  /**
   * @override
   */
  isDefaultValueIgnored: false,

  /**
   * @override
   */
  isCollectionManipulationAllowed: false,

  /**
   * @override
   */
  fieldFactoryMethod(uniqueFieldValueName) {
    const entryFieldsGroup = EntryFieldsGroup.create({
      valueName: uniqueFieldValueName,
    });
    entryFieldsGroup.changeMode(this.mode !== 'view' ? 'edit' : 'view');
    return entryFieldsGroup;
  },
});

/**
 * @param {AtmLambdaConfig|null} rawValue
 * @param {Array<AtmLambdaParameterSpec>} configParameterSpecs
 * @returns {Utils.FormComponent.ValuesContainer}
 */
export function rawValueToAtmLambdaConfigEditorValue(rawValue, configParameterSpecs) {
  const formData = createValuesContainer({
    __fieldsValueNames: [],
  });
  configParameterSpecs?.forEach((paramSpec, idx) => {
    if (!paramSpec?.name || !paramSpec?.dataSpec) {
      return;
    }

    const isOptional = Boolean(paramSpec.isOptional);
    const hasDefaultValue = paramSpec.defaultValue !== null &&
      paramSpec.defaultValue !== undefined;
    const hasExistingValue = rawValue && (paramSpec.name in rawValue);

    let paramValueBuilder = ParamValueBuilder.CustomValue;
    if (!hasExistingValue) {
      if (hasDefaultValue) {
        paramValueBuilder = ParamValueBuilder.DefaultValue;
      } else if (isOptional) {
        paramValueBuilder = ParamValueBuilder.LeaveUnassigned;
      }
    }
    let rawParamValue;
    if (hasExistingValue) {
      rawParamValue = rawValue[paramSpec.name];
    } else if (hasDefaultValue) {
      rawParamValue = paramSpec.defaultValue;
    } else {
      rawParamValue = getDefaultValueForAtmDataSpec(paramSpec.dataSpec);
    }

    const valueName = `entry${idx}`;
    formData.__fieldsValueNames.push(valueName);
    formData[valueName] = createValuesContainer({
      context: {
        ...paramSpec,
      },
      paramValueBuilder,
      paramValue: atmRawValueToFormValue(rawParamValue),
    });
  });
  return formData;
}

/**
 * @param {Utils.FormComponent.ValuesContainer} formValue
 * @returns {AtmLambdaConfig}
 */
export function atmLambdaConfigEditorValueToRawValue(formValue) {
  const atmLambdaConfig = {};

  formValue?.__fieldsValueNames
    ?.map((valueName) => formValue[valueName])
    .filter(Boolean)
    .forEach((entry) => {
      const paramName = entry.context?.name;
      if (
        paramName &&
        entry.paramValueBuilder === ParamValueBuilder.CustomValue
      ) {
        atmLambdaConfig[paramName] = atmFormValueToRawValue(entry.paramValue);
      }
    });

  return atmLambdaConfig;
}

/**
 * @param {Utils.FormComponent.ValuesContainer} formValue
 * @param {Array<AtmLambdaParameterSpec>} targetConfigParameterSpecs
 * @returns {Utils.FormComponent.ValuesContainer}
 */
export function migrateAtmLambdaConfigEditorValueToNewSpecs(
  formValue,
  targetConfigParameterSpecs,
) {
  // Default form value for the new specs. That will be our starting point. We
  // will assign here old values from `formValue` where possible.
  const targetFormValue =
    rawValueToAtmLambdaConfigEditorValue(null, targetConfigParameterSpecs);

  const fieldNamesToMigrate = new Set(formValue.__fieldsValueNames);
  const fieldNamesToOverride = new Set(targetFormValue.__fieldsValueNames);

  // Tries to migrate value from the old spec to the new spec if possible.
  const tryToMigrate = (fieldNameToMigrate, fieldNameToOverride) => {
    const selectedBuilder = formValue[fieldNameToMigrate].paramValueBuilder;
    const targetBuilderOptions = getParamValueBuilderTypesForParamSpec(
      targetFormValue[fieldNameToOverride].context
    );
    const hasTheSameAtmDataSpec = _.isEqual(
      targetFormValue[fieldNameToOverride].context.dataSpec,
      formValue[fieldNameToMigrate].context.dataSpec
    );
    // Can migrate only when selected builder is still available
    // and - if custom value was assigned - data specs matches.
    if (
      targetBuilderOptions.includes(selectedBuilder) && (
        selectedBuilder !== ParamValueBuilder.CustomValue ||
        hasTheSameAtmDataSpec
      )
    ) {
      targetFormValue[fieldNameToOverride].paramValueBuilder =
        formValue[fieldNameToMigrate].paramValueBuilder;
      if (selectedBuilder === ParamValueBuilder.CustomValue) {
        targetFormValue[fieldNameToOverride].paramValue =
          formValue[fieldNameToMigrate].paramValue;
      } else {
        const newValue = targetFormValue[fieldNameToOverride].context.defaultValue ??
          getDefaultValueForAtmDataSpec(
            targetFormValue[fieldNameToOverride].context.dataSpec
          );
        targetFormValue[fieldNameToOverride].paramValue = atmRawValueToFormValue(
          newValue
        );
      }
    }
  };

  // Migrate param values for params with the same name before and after migration
  for (const fieldNameToMigrate of fieldNamesToMigrate) {
    const matchingFieldNameToOverride = [...fieldNamesToOverride].find((fieldName) =>
      targetFormValue[fieldName].context.name ===
      formValue[fieldNameToMigrate].context.name
    );
    if (matchingFieldNameToOverride) {
      tryToMigrate(fieldNameToMigrate, matchingFieldNameToOverride);
      fieldNamesToMigrate.delete(fieldNameToMigrate);
      fieldNamesToOverride.delete(matchingFieldNameToOverride);
    }
  }

  // Migrate param values for params with the same data spec before and after migration
  for (const fieldNameToMigrate of fieldNamesToMigrate) {
    // Try to find any other parameter, that has the same data spec in the old
    // param specs as the current one. If there are some, then we won't know
    // which one of them should be assigned to which new spec - migration is not
    // possible.
    const otherMigrationsWithTheSameDataSpec = [...fieldNamesToMigrate]
      .filter((fieldName) => {
        return fieldName !== fieldNameToMigrate && _.isEqual(
          formValue[fieldName].context.dataSpec,
          formValue[fieldNameToMigrate].context.dataSpec
        );
      });
    // Find all matching places to reuse current value. If there is more than
    // one, then migration is not possible as we don't know which one should be
    // used.
    const matchingFieldNamesToOverride = [...fieldNamesToOverride].filter((fieldName) =>
      _.isEqual(
        targetFormValue[fieldName].context.dataSpec,
        formValue[fieldNameToMigrate].context.dataSpec
      )
    );
    if (
      !otherMigrationsWithTheSameDataSpec.length &&
      matchingFieldNamesToOverride.length === 1
    ) {
      tryToMigrate(fieldNameToMigrate, matchingFieldNamesToOverride[0]);
      fieldNamesToMigrate.delete(fieldNameToMigrate);
      fieldNamesToOverride.delete(matchingFieldNamesToOverride[0]);
    }
  }

  return targetFormValue;
}

const EntryFieldsGroup = FormFieldsGroup.extend({
  /**
   * @override
   */
  name: 'configMapping',

  /**
   * @override
   */
  label: reads('context.name'),

  /**
   * @override
   */
  fields: computed(() => [
    ContextField.create(),
    ParamValueBuilderField.create(),
    ParamValueField.create(),
  ]),

  /**
   * @type {ComputedProperty<AtmLambdaParameterSpec>}
   */
  context: reads('value.context'),
});

const ContextField = HiddenField.extend({
  /**
   * @override
   */
  name: 'context',
});

const ParamValueBuilderField = DropdownField.extend({
  /**
   * @override
   */
  name: 'paramValueBuilder',

  /**
   * @override
   */
  classes: 'floating-field-label',

  /**
   * @override
   */
  options: computed('parent.context', function options() {
    return getParamValueBuilderTypesForParamSpec(this.parent?.context)
      .map((builder) => ({ value: builder }));
  }),
});

const ParamValueField = AtmValueEditorField.extend({
  /**
   * @override
   */
  name: 'paramValue',

  /**
   * @override
   */
  classes: 'floating-field-label',

  /**
   * @override
   */
  isVisible: neq('parent.value.paramValueBuilder', raw(ParamValueBuilder.LeaveUnassigned)),

  /**
   * @override
   */
  isEnabled: eq('parent.value.paramValueBuilder', raw(ParamValueBuilder.CustomValue)),

  /**
   * @override
   */
  atmDataSpec: reads('parent.context.dataSpec'),

  toParamDefaultValueResetter: observer(
    'parent.{value.paramValueBuilder,context.defaultValue}',
    function toParamDefaultValueResetter() {
      if (
        this.parent?.value?.paramValueBuilder === ParamValueBuilder.DefaultValue &&
        !_.isEqual(atmFormValueToRawValue(this.value), this.parent.context?.defaultValue)
      ) {
        this.valueChanged(atmRawValueToFormValue(this.parent.context?.defaultValue));
      }
    }
  ),
});

/**
 * @param {AtmLambdaParameterSpec} paramSpec
 * @returns {Array<ParamValueBuilder>}
 */
function getParamValueBuilderTypesForParamSpec(paramSpec) {
  if (!paramSpec) {
    return [];
  }

  const forbiddenValueBuilders = new Set();
  if (!paramSpec.isOptional) {
    forbiddenValueBuilders.add(ParamValueBuilder.LeaveUnassigned);
  }
  if (paramSpec.defaultValue === null || paramSpec.defaultValue === undefined) {
    forbiddenValueBuilders.add(ParamValueBuilder.DefaultValue);
  } else {
    forbiddenValueBuilders.add(ParamValueBuilder.LeaveUnassigned);
  }
  return paramValueBuilderArray
    .filter((builder) => !forbiddenValueBuilders.has(builder));
}
