/**
 * Provides a form element capable of showing and modifying file data spec
 * params. It also provides two methods for conversion between form values
 * and data spec params in both directions.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { get, set, computed, observer } from '@ember/object';
import { reads } from '@ember/object/computed';
import { scheduleOnce } from '@ember/runloop';
import { hash, raw } from 'ember-awesome-macros';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import FormFieldsGroup from 'onedata-gui-common/utils/form-component/form-fields-group';
import DropdownField from 'onedata-gui-common/utils/form-component/dropdown-field';
import TagsField from 'onedata-gui-common/utils/form-component/tags-field';
import { getAtmDataSpecParamsConditions } from 'onedata-gui-common/utils/atm-workflow/data-spec/types';
import {
  atmFileTypesArray,
  translateAtmFileType,
  AtmFileAttribute,
  atmFileAttributesArray,
} from 'onedata-gui-common/utils/atm-workflow/data-spec/types/file';
import { createValuesContainer } from 'onedata-gui-common/utils/form-component/values-container';

const i18nPrefix = 'utils.atmWorkflow.dataSpecEditor.paramsEditors.file';

const FormElement = FormFieldsGroup.extend({
  /**
   * @virtual
   * @type {Array<AtmDataSpecFilter>}
   */
  dataSpecFilters: undefined,

  /**
   * @type {ComputedProperty<boolean>}
   */
  showExpandParams: reads('parent.showExpandParams'),

  /**
   * @type {ComputedProperty<Array<AtmFileType>>}
   */
  allowedFileTypes: computed('dataSpecFilters', function allowedFileTypes() {
    const conditions = getAtmDataSpecParamsConditions(
      'file',
      this.dataSpecFilters ?? []
    );
    return conditions.allowedFileTypes;
  }),

  classes: 'file-data-spec-params-editor params-editors',
  i18nPrefix: `${i18nPrefix}.fields`,
  // Does not take parent fields group translation path into account
  translationPath: '',
  size: 'sm',
  fields: computed(function fields() {
    return [
      FileTypeField.create(),
      FileAttributesField.create(),
    ];
  }),
});

const FileTypeField = DropdownField.extend({
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

const FileAttributesField = TagsField.extend({
  name: 'fileAttributes',
  tagEditorComponentName: 'tags-input/selector-editor',
  sort: true,
  isVisible: reads('parent.showExpandParams'),
  allowedTags: computed(function allowedTags() {
    return [...atmFileAttributesArray].sort().map((attrName) => ({ label: attrName }));
  }),
  tagEditorSettings: hash('allowedTags'),
  defaultValue: raw([AtmFileAttribute.FileId]),
});

/**
 * @param {Utils.FormComponent.ValuesContainer} values Values from file editor
 * @param {boolean} [includeExpandParams]
 * @returns {Omit<AtmFileDataSpec, 'type'>}
 */
function formValuesToAtmDataSpecParams(values, includeExpandParams = false) {
  const formFileType = values && get(values, 'fileType');
  const fileType = atmFileTypesArray.includes(formFileType) ?
    formFileType : atmFileTypesArray[0];
  const params = { fileType };

  if (includeExpandParams) {
    params.attributes = Array.isArray(values.fileAttributes) ? values.fileAttributes : [];
  } else {
    params.attributes = null;
  }

  return params;
}

/**
 * @param {AtmFileDataSpec} atmDataSpec
 * @param {boolean} [includeExpandParams]
 * @returns {Utils.FormComponent.ValuesContainer} form values ready to use in a form
 */
function atmDataSpecParamsToFormValues(atmDataSpec, includeExpandParams = false) {
  const fileType = atmDataSpec?.fileType ?? atmFileTypesArray[0];
  const valuesContainer = createValuesContainer({ fileType });
  if (includeExpandParams) {
    const fileAttributes = atmDataSpec?.attributes ?? [AtmFileAttribute.FileId];
    set(valuesContainer, 'fileAttributes', fileAttributes);
  }
  return valuesContainer;
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
  let fileAttributes;
  if (values.fileAttributes?.length) {
    fileAttributes = values.fileAttributes.join(', ');
  }
  return i18n.t(`${i18nPrefix}.summary${fileAttributes ? 'WithAttrs' : ''}`, {
    fileType: translateAtmFileType(i18n, fileType, { upperFirst: true }),
    fileAttributes,
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
  formValuesToAtmDataSpecParams,
  atmDataSpecParamsToFormValues,
  summarizeFormValues,
  shouldWarnOnRemove,
};
