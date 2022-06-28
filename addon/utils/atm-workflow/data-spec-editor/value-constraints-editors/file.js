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
import FormFieldsGroup from 'onedata-gui-common/utils/form-component/form-fields-group';
import DropdownField from 'onedata-gui-common/utils/form-component/dropdown-field';
import {
  fileTypes,
  fileSupertypes,
  fileSubtypes,
  translateFileType,
} from 'onedata-gui-common/utils/atm-workflow/data-spec/file';
import { createValuesContainer } from 'onedata-gui-common/utils/form-component/values-container';

const i18nPrefix = 'utils.atmWorkflow.dataSpecEditor.valueConstraintsEditors.file';

const FormElement = FormFieldsGroup.extend({
  /**
   * @virtual
   * @type {Array<DataSpecEditorFilter>}
   */
  dataTypeFilters: undefined,

  /**
   * @type {ComputedProperty<Array<AtmFileType>>}
   */
  allowedFileTypes: computed('dataTypeFilters', function allowedFileTypes() {
    const dataTypeFilters = this.get('dataTypeFilters') || [];
    const allowedTypes = [];
    for (const fileType of fileTypes) {
      let typeRejected = false;
      for (const dataTypeFilter of dataTypeFilters) {
        const fileTypeFromFilter = getFileTypeFromDataTypeFilter(dataTypeFilter);
        switch (dataTypeFilter.filterType) {
          case 'typeOrSupertype':
            if (
              fileType !== fileTypeFromFilter &&
              !(fileSupertypes[fileTypeFromFilter] || []).includes(fileType)
            ) {
              typeRejected = true;
            }
            break;
          case 'typeOrSubtype':
            if (
              fileType !== fileTypeFromFilter &&
              !(fileSubtypes[fileTypeFromFilter] || []).includes(fileType)
            ) {
              typeRejected = true;
            }
            break;
          case 'forbiddenType':
            // `forbiddenType` filter works only at the whole data specs level.
            break;
        }
        if (typeRejected) {
          break;
        }
      }
      if (!typeRejected) {
        allowedTypes.push(fileType);
      }
    }
    return allowedTypes;
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

function getFileTypeFromDataTypeFilter(dataTypeFilter) {
  let fileDataSpec = null;
  switch (dataTypeFilter && dataTypeFilter.filterType) {
    case 'typeOrSupertype':
    case 'typeOrSubtype':
      fileDataSpec = get(dataTypeFilter, 'type');
      break;
    case 'forbiddenType':
      fileDataSpec = get(dataTypeFilter, 'forbiddenType');
      break;
  }
  return fileDataSpec && fileDataSpec.type === 'file' &&
    get(fileDataSpec, 'valuConstraints.fileType') || null;
}

const FileTypeDropdown = DropdownField.extend({
  options: computed('parent.allowedFileTypes', function options() {
    const i18n = this.get('i18n');
    return this.get('parent.allowedFileTypes').map((fileType) => ({
      value: fileType,
      label: translateFileType(i18n, fileType),
    }));
  }),
  defaultValue: reads('parent.allowedFileTypes.0'),
  name: 'fileType',
  allowedFileTypesObserver: observer(
    'parent.allowedFileTypes',
    function allowedFileTypesObserver() {
      const value = this.get('value');
      const allowedFileTypes = this.get('parent.allowedFileTypes');
      if (value && !allowedFileTypes.includes(value)) {
        this.valueChanged(allowedFileTypes[0]);
      }
    }
  ),
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
