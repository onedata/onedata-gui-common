/**
 * Provides a form element capable of showing, creating and modifying number
 * data spec value constraints. It also provides two methods for conversion
 * between form values and value constraints in both directions.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed, observer } from '@ember/object';
import { reads } from '@ember/object/computed';
import { scheduleOnce } from '@ember/runloop';
import { gt, raw } from 'ember-awesome-macros';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import FormFieldsGroup from 'onedata-gui-common/utils/form-component/form-fields-group';
import ToggleField from 'onedata-gui-common/utils/form-component/toggle-field';
import {
  AtmDataSpecType,
  getAtmValueConstraintsConditions,
} from 'onedata-gui-common/utils/atm-workflow/data-spec/types';
import { createValuesContainer } from 'onedata-gui-common/utils/form-component/values-container';
import validate from 'onedata-gui-common/utils/atm-workflow/value-validators/number';
import {
  ValueEditorField as AtmValueEditorField,
  rawValueToFormValue as atmRawValueToFormValue,
  formValueToRawValue as atmFormValueToRawValue,
} from 'onedata-gui-common/utils/atm-workflow/value-editors';

const i18nPrefix = 'utils.atmWorkflow.dataSpecEditor.valueConstraintsEditors.number';

const FormElement = FormFieldsGroup.extend({
  /**
   * @virtual
   * @type {Array<AtmDataSpecFilter>}
   */
  dataSpecFilters: undefined,

  /**
   * @override
   */
  classes: 'number-value-constraints-editor',

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
      IntegersOnlyToggle.create(),
      AllowedValuesEditor.create(),
    ];
  }),

  /**
   * @type {ComputedProperty<Array<boolean>>}
   */
  integersOnlyConstraintValues: computed(
    'dataSpecFilters',
    function integersOnlyConstraintValues() {
      const conditions = getAtmValueConstraintsConditions(
        AtmDataSpecType.Number,
        this.dataSpecFilters ?? []
      );
      return conditions.integersOnlyConstraintValues;
    }
  ),
});

const IntegersOnlyToggle = ToggleField.extend({
  /**
   * @override
   */
  name: 'integersOnly',

  /**
   * @override
   */
  defaultValue: reads('parent.integersOnlyConstraintValues.0'),

  /**
   * @override
   */
  isEnabled: gt('parent.integersOnlyConstraintValues.length', raw(1)),

  constraintValuesObserver: observer(
    'parent.integersOnlyConstraintValues',
    function constraintValuesObserver() {
      scheduleOnce('afterRender', this, 'adjustValueForNewConstraintValues');
    }
  ),

  adjustValueForNewConstraintValues() {
    safeExec(this, () => {
      if (!this.parent.integersOnlyConstraintValues.includes(this.value)) {
        this.valueChanged(this.parent.integersOnlyConstraintValues[0]);
      }
    });
  },
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
        type: AtmDataSpecType.Number,
      },
    },
  }),
});

/**
 * @param {Utils.FormComponent.ValuesContainer} values Values from number editor
 * @returns {AtmNumberValueConstraints} value constraints
 */
function formValuesToValueConstraints(values) {
  const constraints = {};

  if (typeof values?.integersOnly === 'boolean') {
    constraints.integersOnly = values.integersOnly;
  }

  const allowedValues = atmFormValueToRawValue(values?.allowedValues);
  if (allowedValues !== null) {
    constraints.allowedValues = allowedValues;
  }

  return constraints;
}

/**
 * @param {AtmNumberValueConstraints} valueConstraints value constraints taken
 *   from the raw data spec
 * @returns {Utils.FormComponent.ValuesContainer} form values ready to use in
 *   a form
 */
function valueConstraintsToFormValues(valueConstraints) {
  return createValuesContainer({
    integersOnly: Boolean(valueConstraints?.integersOnly),
    allowedValues: atmRawValueToFormValue(valueConstraints?.allowedValues, true),
  });
}

/**
 * @param {Ember.Service} i18n
 * @param {Utils.FormComponent.ValuesContainer} values
 * @returns {SafeString}
 */
function summarizeFormValues(i18n, values) {
  const integersOnly = Boolean(values?.integersOnly);
  let allowedNumbersText = '';

  if (values?.allowedValues?.hasValue) {
    const allowedValues = values?.allowedValues?.value;
    const validAllowedValues = allowedValues?.filter((value) => validate(value, {
      type: AtmDataSpecType.Number,
      valueConstraints: {
        integersOnly,
      },
    }));
    if (validAllowedValues?.length) {
      allowedNumbersText = validAllowedValues.join(', ');
    } else {
      allowedNumbersText = i18n.t(`${i18nPrefix}.summary.allowedNumbers.none`);
    }
  } else {
    const i18nKey = values?.integersOnly ? 'integersOnly' : 'any';
    allowedNumbersText = i18n.t(`${i18nPrefix}.summary.allowedNumbers.${i18nKey}`);
  }

  return i18n.t(`${i18nPrefix}.summary.base`, {
    allowedNumbers: allowedNumbersText,
  });
}

/**
 * @param {Utils.FormComponent.ValuesContainer} values
 * @returns {boolean}
 */
function shouldWarnOnRemove(values) {
  return values?.allowedValues?.hasValue && values?.allowedValues?.value?.length > 0;
}

export default {
  FormElement,
  formValuesToValueConstraints,
  valueConstraintsToFormValues,
  summarizeFormValues,
  shouldWarnOnRemove,
};
