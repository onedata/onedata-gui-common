/**
 * Provides a form element capable of showing, creating and modifying file data spec
 * value constraints. It also provides two methods for conversion between form values
 * and value constraints in both directions.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { get, computed, observer } from '@ember/object';
import { reads } from '@ember/object/computed';
import { scheduleOnce } from '@ember/runloop';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import FormFieldsGroup from 'onedata-gui-common/utils/form-component/form-fields-group';
import DropdownField from 'onedata-gui-common/utils/form-component/dropdown-field';
import { getAtmValueConstraintsConditions } from 'onedata-gui-common/utils/atm-workflow/data-spec/types';
import {
  atmFileTypesArray,
  translateAtmFileType,
} from 'onedata-gui-common/utils/atm-workflow/data-spec/types/file';
import { createValuesContainer } from 'onedata-gui-common/utils/form-component/values-container';

const i18nPrefix = 'utils.atmWorkflow.dataSpecEditor.valueConstraintsEditors.file';

const FormElement = FormFieldsGroup.extend({
  /**
   * @virtual
   * @type {Array<AtmDataSpecFilter>}
   */
  dataSpecFilters: undefined,

  /**
   * @type {ComputedProperty<Array<AtmFileType>>}
   */
  allowedFileTypes: computed('dataSpecFilters', function allowedFileTypes() {
    const conditions = getAtmValueConstraintsConditions(
      'file',
      this.dataSpecFilters ?? []
    );
    return conditions.allowedFileTypes;
  }),

  classes: 'file-value-constraints-editor',
  i18nPrefix: `${i18nPrefix}.fields`,
  // Does not take parent fields group translation path into account
  translationPath: '',
  size: 'sm',
  fields: computed(function fields() {
    return [
      FileTypeDropdown.create(),
    ];
  }),
});

const FileTypeDropdown = DropdownField.extend({
  options: computed('parent.allowedFileTypes', function options() {
    const i18n = this.get('i18n');
    return this.get('parent.allowedFileTypes').map((fileType) => ({
      value: fileType,
      label: translateAtmFileType(i18n, fileType, { upperFirst: true }),
    }));
  }),
  defaultValue: reads('parent.allowedFileTypes.0'),
  name: 'fileType',
  allowedFileTypesObserver: observer(
    'parent.allowedFileTypes',
    function allowedFileTypesObserver() {
      scheduleOnce('afterRender', this, 'adjustValueForNewOptions');
    }
  ),
  adjustValueForNewOptions() {
    safeExec(this, () => {
      const value = this.get('value');
      const allowedFileTypes = this.get('parent.allowedFileTypes');
      if (value && !allowedFileTypes.includes(value)) {
        this.valueChanged(allowedFileTypes[0]);
      }
    });
  },
});

/**
 * @param {Utils.FormComponent.ValuesContainer} values Values from file editor
 * @returns {AtmFileValueConstraints} value constraints
 */
function formValuesToValueConstraints(values) {
  const formFileType = values && get(values, 'fileType');
  const fileType = atmFileTypesArray.includes(formFileType) ?
    formFileType : atmFileTypesArray[0];
  return { fileType };
}

/**
 * @param {AtmFileValueConstraints} valueConstraints value
 * constraints taken from the raw data spec
 * @returns {Utils.FormComponent.ValuesContainer} form values ready to use in a form
 */
function valueConstraintsToFormValues(valueConstraints) {
  const fileType = valueConstraints && valueConstraints.fileType || atmFileTypesArray[0];
  return createValuesContainer({
    fileType,
  });
}

/**
 * @param {Ember.Service} i18n
 * @param {Utils.FormComponent.ValuesContainer} values
 * @returns {SafeString}
 */
function summarizeFormValues(i18n, values) {
  const formFileType = values && get(values, 'fileType');
  const fileType = atmFileTypesArray.includes(formFileType) ?
    formFileType : atmFileTypesArray[0];
  return i18n.t(`${i18nPrefix}.summary`, {
    fileType: translateAtmFileType(i18n, fileType, { upperFirst: true }),
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
