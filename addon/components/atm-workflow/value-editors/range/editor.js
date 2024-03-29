/**
 * A range value editor component.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed, setProperties } from '@ember/object';
import { reads } from '@ember/object/computed';
import { scheduleOnce } from '@ember/runloop';
import { not } from 'ember-awesome-macros';
import _ from 'lodash';
import { validator } from 'ember-cp-validations';
import EditorBase from '../commons/editor-base';
import FormFieldsRootGroup from 'onedata-gui-common/utils/form-component/form-fields-root-group';
import NumberField from 'onedata-gui-common/utils/form-component/number-field';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import layout from 'onedata-gui-common/templates/components/atm-workflow/value-editors/range/editor';

const formFieldNames = Object.freeze(['start', 'end', 'step']);

export default EditorBase.extend(I18n, {
  layout,

  /**
   * @override
   */
  i18nPrefix: 'components.atmWorkflow.valueEditors.range.editor',

  /**
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsRootGroup>}
   */
  formRootGroup: computed(function formRootGroup() {
    return FormRootGroup.create({ component: this });
  }),

  /**
   * @override
   */
  handleStateChange() {
    this._super(...arguments);
    if (!this.editorState) {
      return;
    }

    if (this.doesFormValueDiffer(this.editorState.value)) {
      const newFormData = formFieldNames.reduce((acc, fieldName) => {
        acc[fieldName] = String(this.editorState.value?.[fieldName] ?? '');
        return acc;
      }, {});
      setProperties(this.formRootGroup.valuesSource, newFormData);
    }
  },

  /**
   * @returns {void}
   */
  propagateValueChange() {
    this.editorState.value = this.getFormValues();
  },

  /**
   * @param {unknown} referenceValue
   * @returns {boolean}
   */
  doesFormValueDiffer(referenceValue) {
    return !_.isEqual(this.getFormValues(), referenceValue);
  },

  /**
   * @returns {number}
   */
  getFormValues() {
    const formValues = {};
    formFieldNames.forEach((fieldName) => {
      const field = this.formRootGroup.getFieldByPath(fieldName);
      const fieldValue = field.dumpValue();
      formValues[fieldName] = Number.parseFloat(fieldValue);
    });
    return formValues;
  },
});

const FormRootGroup = FormFieldsRootGroup.extend({
  /**
   * @virtual
   * @type {Components.AtmWorkflow.ValueEditors.Range.Editor}
   */
  component: undefined,

  /**
   * @override
   */
  ownerSource: reads('component'),

  /**
   * @override
   */
  size: 'sm',

  /**
   * @override
   */
  i18nPrefix: reads('component.i18nPrefix'),

  /**
   * @override
   */
  isEnabled: not('component.isDisabled'),

  /**
   * @override
   */
  fields: computed(() => [
    NumberField.create({
      name: 'start',
      integer: true,
      withValidationMessage: false,
      customValidators: [
        validator('inline', {
          validate(value, options, model) {
            const field = model.field;
            const fieldPath = field.path;
            const parsedValue = parseRangeNumberString(value);
            const rangeEnd = parseRangeNumberString(model.valuesSource.end);
            const rangeStep = parseRangeNumberString(model.valuesSource.step);
            if (
              Number.isNaN(parsedValue) ||
              Number.isNaN(rangeEnd) ||
              Number.isNaN(rangeStep) ||
              rangeStep === 0
            ) {
              return true;
            }

            if (rangeStep > 0 && parsedValue > rangeEnd) {
              return String(field.t(`${fieldPath}.errors.gtEndForPositiveStep`));
            } else if (rangeStep < 0 && parsedValue < rangeEnd) {
              return String(field.t(`${fieldPath}.errors.ltEndForNegativeStep`));
            }
            return true;
          },
          dependentKeys: ['model.valuesSource.end', 'model.valuesSource.step'],
        }),
      ],
    }),
    NumberField.create({
      name: 'end',
      integer: true,
      withValidationMessage: false,
      customValidators: [
        validator('inline', {
          validate(value, options, model) {
            const field = model.field;
            const fieldPath = field.path;
            const parsedValue = parseRangeNumberString(value);
            const rangeStart = parseRangeNumberString(model.valuesSource.start);
            const rangeStep = parseRangeNumberString(model.valuesSource.step);
            if (
              Number.isNaN(parsedValue) ||
              Number.isNaN(rangeStart) ||
              Number.isNaN(rangeStep) ||
              rangeStep === 0
            ) {
              return true;
            }

            if (rangeStep > 0 && parsedValue < rangeStart) {
              return String(field.t(`${fieldPath}.errors.ltStartForPositiveStep`));
            } else if (rangeStep < 0 && parsedValue > rangeStart) {
              return String(field.t(`${fieldPath}.errors.gtStartForPositiveStep`));
            }
            return true;
          },
          dependentKeys: [
            'model.valuesSource.start',
            'model.valuesSource.step',
          ],
        }),
      ],
    }),
    NumberField.create({
      name: 'step',
      integer: true,
      withValidationMessage: false,
      customValidators: [
        validator('exclusion', {
          in: ['0'],
        }),
      ],
    }),
  ]),

  /**
   * @override
   */
  onValueChange() {
    this._super(...arguments);
    scheduleOnce('afterRender', this.component, 'propagateValueChange');
  },
});

function parseRangeNumberString(rangeNumberString) {
  const stringAsNumber = Number(rangeNumberString);
  return Number.isInteger(stringAsNumber) &&
    rangeNumberString &&
    rangeNumberString.trim().length ?
    stringAsNumber : NaN;
}
