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

/**
 * @param {Utils.FormComponent.ValuesContainer} values Values from number editor
 * @returns {AtmNumberValueConstraints} value constraints
 */
function formValuesToValueConstraints(values) {
  return (typeof values?.integersOnly === 'boolean') ? {
    integersOnly: values.integersOnly,
  } : {};
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
  });
}

/**
 * @param {Ember.Service} i18n
 * @param {Utils.FormComponent.ValuesContainer} values
 * @returns {SafeString}
 */
function summarizeFormValues(i18n, values) {
  const allowedNumbers = values?.integersOnly ? 'integersOnly' : 'any';
  return i18n.t(`${i18nPrefix}.summary.base`, {
    allowedNumbers: i18n.t(`${i18nPrefix}.summary.allowedNumbers.${allowedNumbers}`),
  });
}

/**
 * @returns {boolean}
 */
function shouldWarnOnRemove() {
  return false;
}

export default {
  FormElement,
  formValuesToValueConstraints,
  valueConstraintsToFormValues,
  summarizeFormValues,
  shouldWarnOnRemove,
};
