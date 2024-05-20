/**
 * Provides a form element capable of showing and modifying group data spec
 * params. It also provides two methods for conversion between form values
 * and data spec params in both directions.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { set, computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { hash, raw } from 'ember-awesome-macros';
import FormFieldsGroup from 'onedata-gui-common/utils/form-component/form-fields-group';
import TagsField from 'onedata-gui-common/utils/form-component/tags-field';
import {
  GroupAttribute,
  groupAttributesArray,
} from 'onedata-gui-common/utils/group';
import { createValuesContainer } from 'onedata-gui-common/utils/form-component/values-container';

const i18nPrefix = 'utils.atmWorkflow.dataSpecEditor.paramsEditors.group';

/**
 * @param {boolean} [includeExpandParams]
 * @returns {boolean}
 */
function hasForm(includeExpandParams = false) {
  return includeExpandParams;
}

const FormElement = FormFieldsGroup.extend({
  /**
   * @type {ComputedProperty<boolean>}
   */
  showExpandParams: reads('parent.showExpandParams'),

  classes: 'group-data-spec-params-editor data-spec-params-editor-with-attributes params-editors',
  i18nPrefix: `${i18nPrefix}.fields`,
  // Does not take parent fields group translation path into account
  translationPath: '',
  size: 'sm',
  fields: computed(function fields() {
    return [
      GroupAttributesField.create(),
    ];
  }),
});

const GroupAttributesField = TagsField.extend({
  name: 'groupAttributes',
  tagEditorComponentName: 'tags-input/selector-editor',
  sort: true,
  isVisible: reads('parent.showExpandParams'),
  allowedTags: computed(function allowedTags() {
    return [...groupAttributesArray].sort().map((attrName) => ({ label: attrName }));
  }),
  tagEditorSettings: hash('allowedTags'),
  defaultValue: raw([GroupAttribute.GroupId]),
});

/**
 * @param {Utils.FormComponent.ValuesContainer} values Values from group editor
 * @param {boolean} [includeExpandParams]
 * @returns {Omit<AtmGroupDataSpec, 'type'>}
 */
function formValuesToAtmDataSpecParams(values, includeExpandParams = false) {
  if (includeExpandParams) {
    return {
      attributes: Array.isArray(values.groupAttributes) ? values.groupAttributes : [],
    };
  } else {
    return {
      attributes: null,
    };
  }
}

/**
 * @param {AtmGroupDataSpec} atmDataSpec
 * @param {boolean} [includeExpandParams]
 * @returns {Utils.FormComponent.ValuesContainer} form values ready to use in a form
 */
function atmDataSpecParamsToFormValues(atmDataSpec, includeExpandParams = false) {
  const valuesContainer = createValuesContainer();
  if (includeExpandParams) {
    const groupAttributes = atmDataSpec?.attributes ?? [GroupAttribute.GroupId];
    set(valuesContainer, 'groupAttributes', groupAttributes);
  }
  return valuesContainer;
}

/**
 * @param {Ember.Service} i18n
 * @param {Utils.FormComponent.ValuesContainer} values
 * @returns {SafeString}
 */
function summarizeFormValues(i18n, values) {
  let groupAttributes;
  if (values.groupAttributes?.length) {
    groupAttributes = values.groupAttributes.join(', ');
  }
  return i18n.t(`${i18nPrefix}.summary`, { groupAttributes });
}

/**
 * @returns {boolean}
 */
function shouldWarnOnRemove() {
  return false;
}

export default {
  hasForm,
  FormElement,
  formValuesToAtmDataSpecParams,
  atmDataSpecParamsToFormValues,
  summarizeFormValues,
  shouldWarnOnRemove,
};
