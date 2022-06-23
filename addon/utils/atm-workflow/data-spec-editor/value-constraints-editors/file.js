/**
 * Provides a form element capable of showing, creating and modifying file data spec
 * value constraints. It also provides two methods for conversion between form values
 * and value constraints in both directions.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { get, computed } from '@ember/object';
import FormFieldsGroup from 'onedata-gui-common/utils/form-component/form-fields-group';
import DropdownField from 'onedata-gui-common/utils/form-component/dropdown-field';
import {
  fileTypes,
  translateFileType,
} from 'onedata-gui-common/utils/atm-workflow/data-spec/file';
import { createValuesContainer } from 'onedata-gui-common/utils/form-component/values-container';

const i18nPrefix = 'utils.atmWorkflow.dataSpecEditor.valueConstraintsEditors.file';

const FormElement = FormFieldsGroup.extend({
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
  options: computed(function options() {
    const i18n = this.get('i18n');
    return fileTypes.map((fileType) => ({
      value: fileType,
      label: translateFileType(i18n, fileType),
    }));
  }),
  name: 'fileType',
  defaultValue: fileTypes[0],
});

/**
 * @param {Utils.FormComponent.ValuesContainer} values Values from file editor
 * @returns {AtmFileValueConstraints} value constraints
 */
function formValuesToValueConstraints(values) {
  const formFileType = values && get(values, 'fileType');
  const fileType = fileTypes.includes(formFileType) ? formFileType : fileTypes[0];
  return { fileType };
}

/**
 * @param {AtmFileValueConstraints} valueConstraints value
 * constraints taken from the raw data spec
 * @returns {Utils.FormComponent.ValuesContainer} form values ready to use in a form
 */
function valueConstraintsToFormValues(valueConstraints) {
  const fileType = valueConstraints && valueConstraints.fileType || fileTypes[0];
  return createValuesContainer({
    fileType,
  });
}

function summarizeFormValues(i18n, values) {
  const formFileType = values && get(values, 'fileType');
  const fileType = fileTypes.includes(formFileType) ? formFileType : fileTypes[0];
  return i18n.t(`${i18nPrefix}.summary`, {
    fileType: translateFileType(i18n, fileType),
  });
}

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
