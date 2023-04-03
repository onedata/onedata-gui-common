/**
 * Provides a form element capable of showing, creating and modifying string
 * data spec value constraints. It also provides two methods for conversion
 * between form values and value constraints in both directions.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import FormFieldsGroup from 'onedata-gui-common/utils/form-component/form-fields-group';
import { AtmDataSpecType } from 'onedata-gui-common/utils/atm-workflow/data-spec/types';
import { createValuesContainer } from 'onedata-gui-common/utils/form-component/values-container';
import validate from 'onedata-gui-common/utils/atm-workflow/value-validators/string';
import {
  ValueEditorField as AtmValueEditorField,
  rawValueToFormValue as atmRawValueToFormValue,
  formValueToRawValue as atmFormValueToRawValue,
} from 'onedata-gui-common/utils/atm-workflow/value-editors';

const i18nPrefix = 'utils.atmWorkflow.dataSpecEditor.valueConstraintsEditors.string';

const FormElement = FormFieldsGroup.extend({
  /**
   * @virtual
   * @type {Array<AtmDataSpecFilter>}
   */
  dataSpecFilters: undefined,

  /**
   * @override
   */
  classes: 'string-value-constraints-editor value-constraints-editor',

  /**
   * @override
   */
  i18nPrefix: `${i18nPrefix}.fields`,

  /**
   * Does not take parent fields group translation path into account
   * @override
   */
  translationPath: '',

  /**
   * @override
   */
  size: 'sm',

  /**
   * @override
   */
  fields: computed(function fields() {
    return [
      AllowedValuesEditor.create(),
    ];
  }),
});

const AllowedValuesEditor = AtmValueEditorField.extend({
  /**
   * @override
   */
  name: 'allowedValues',

  /**
   * @override
   */
  isOptional: true,

  /**
   * @override
   */
  atmDataSpec: Object.freeze({
    type: AtmDataSpecType.Array,
    valueConstraints: {
      itemDataSpec: {
        type: AtmDataSpecType.String,
      },
    },
  }),
});

/**
 * @param {Utils.FormComponent.ValuesContainer} values Values from string editor
 * @returns {AtmStringValueConstraints} value constraints
 */
function formValuesToValueConstraints(values) {
  const constraints = {};

  const allowedValues = atmFormValueToRawValue(values?.allowedValues);
  if (Array.isArray(allowedValues)) {
    constraints.allowedValues = allowedValues;
  }

  return constraints;
}

/**
 * @param {AtmStringValueConstraints} valueConstraints value constraints taken
 *   from the raw data spec
 * @returns {Utils.FormComponent.ValuesContainer} form values ready to use in
 *   a form
 */
function valueConstraintsToFormValues(valueConstraints) {
  return createValuesContainer({
    allowedValues: atmRawValueToFormValue(valueConstraints?.allowedValues, true),
  });
}

/**
 * @param {Ember.Service} i18n
 * @param {Utils.FormComponent.ValuesContainer} values
 * @returns {SafeString}
 */
function summarizeFormValues(i18n, values) {
  let allowedStringsText = '';

  if (values?.allowedValues?.hasValue) {
    const allowedValues = values.allowedValues.value;
    const validAllowedValues = allowedValues?.filter((value) => validate(value, {
      type: AtmDataSpecType.String,
    }));
    if (validAllowedValues?.length) {
      allowedStringsText = validAllowedValues.map((s) => `"${s}"`).join(', ');
    } else {
      allowedStringsText = i18n.t(`${i18nPrefix}.summary.allowedStrings.none`);
    }
  } else {
    allowedStringsText = i18n.t(`${i18nPrefix}.summary.allowedStrings.any`);
  }

  return i18n.t(`${i18nPrefix}.summary.base`, {
    allowedStrings: allowedStringsText,
  });
}

/**
 * @param {Utils.FormComponent.ValuesContainer} values
 * @returns {boolean}
 */
function shouldWarnOnRemove(values) {
  return values?.allowedValues?.hasValue && values.allowedValues.value?.length > 0;
}

export default {
  FormElement,
  formValuesToValueConstraints,
  valueConstraintsToFormValues,
  summarizeFormValues,
  shouldWarnOnRemove,
};
