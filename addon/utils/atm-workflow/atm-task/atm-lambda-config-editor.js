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
import findTypedElementsMigration from 'onedata-gui-common/utils/atm-workflow/find-typed-elements-migration';

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
  const fromSpecs = formValue.__fieldsValueNames.map((fieldName) => ({
    name: formValue[fieldName].context.name,
    dataSpec: formValue[fieldName].context.dataSpec,
  }));
  const migration = findTypedElementsMigration(fromSpecs, targetConfigParameterSpecs);

  // Default form value for the new specs. That will be our starting point. We
  // will assign here old values from `formValue` where possible.
  const targetFormValue =
    rawValueToAtmLambdaConfigEditorValue(null, targetConfigParameterSpecs);

  Object.keys(migration).forEach((fromName) => {
    const toName = migration[fromName];
    if (!toName) {
      return;
    }

    const fromFieldName = formValue.__fieldsValueNames.find((fieldName) =>
      formValue[fieldName].context.name === fromName
    );
    const toFieldName = targetFormValue.__fieldsValueNames.find((fieldName) =>
      targetFormValue[fieldName].context.name === toName
    );

    if (!fromFieldName || !toFieldName) {
      return;
    }

    const selectedBuilder = formValue[fromFieldName].paramValueBuilder;
    const targetBuilderOptions = getParamValueBuilderTypesForParamSpec(
      targetFormValue[toFieldName].context
    );
    const hasTheSameAtmDataSpec = _.isEqual(
      targetFormValue[toFieldName].context.dataSpec,
      formValue[fromFieldName].context.dataSpec
    );
    // Can migrate only when selected builder is still available
    // and - if custom value was assigned - data specs matches.
    if (
      targetBuilderOptions.includes(selectedBuilder) && (
        selectedBuilder !== ParamValueBuilder.CustomValue ||
        hasTheSameAtmDataSpec
      )
    ) {
      targetFormValue[toFieldName].paramValueBuilder =
        formValue[fromFieldName].paramValueBuilder;
      if (selectedBuilder === ParamValueBuilder.CustomValue) {
        targetFormValue[toFieldName].paramValue =
          formValue[fromFieldName].paramValue;
      } else {
        const newValue = targetFormValue[toFieldName].context.defaultValue ??
          getDefaultValueForAtmDataSpec(
            targetFormValue[toFieldName].context.dataSpec
          );
        targetFormValue[toFieldName].paramValue = atmRawValueToFormValue(
          newValue
        );
      }
    }
  });

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
