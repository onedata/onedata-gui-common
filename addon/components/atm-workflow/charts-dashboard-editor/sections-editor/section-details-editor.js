/**
 * Allows edition of section details - title, title tip and description.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed, observer, set } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { tag } from 'ember-awesome-macros';
import TextField from 'onedata-gui-common/utils/form-component/text-field';
import TextareaField from 'onedata-gui-common/utils/form-component/textarea-field';
import FormFieldsRootGroup from 'onedata-gui-common/utils/form-component/form-fields-root-group';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import layout from 'onedata-gui-common/templates/components/atm-workflow/charts-dashboard-editor/sections-editor/section-details-editor';

export default Component.extend(I18n, {
  classNames: ['section-details-editor'],
  layout,

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.atmWorkflow.chartsDashboardEditor.sectionsEditor.sectionDetailsEditor',

  /**
   * @virtual
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.Section}
   */
  section: undefined,

  /**
   * @virtual
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.ActionsFactory}
   */
  actionsFactory: undefined,

  /**
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsRootGroup>}
   */
  detailsForm: computed(function detailsForm() {
    return DetailsForm.create({
      component: this,
    });
  }),

  formValuesUpdater: observer(
    'section.{title,titleTip,description}',
    function formValuesUpdater() {
      ['title', 'titleTip', 'description'].forEach((fieldName) => {
        const newValue = this.section?.[fieldName] ?? '';
        if (newValue !== this.detailsForm.valuesSource[fieldName]) {
          set(this.detailsForm.valuesSource, fieldName, newValue);
        }
      });
    }
  ),

  init() {
    this._super(...arguments);
    this.formValuesUpdater();
  },

  /**
   * @param {string} fieldName
   * @param {string} value
   * @returns {void}
   */
  onValueChange(fieldName, value) {
    if (!fieldName) {
      return;
    }

    let changeType;
    switch (fieldName) {
      case 'title':
      case 'titleTip':
      case 'description':
        changeType = 'continuous';
        break;
      default:
        changeType = 'discrete';
        break;
    }

    const action = this.actionsFactory.createChangeElementPropertyAction({
      element: this.section,
      propertyName: fieldName,
      newValue: value,
      changeType,
    });
    action.execute();
  },

  /**
   * @returns {void}
   */
  onEditionInterrupted() {
    this.actionsFactory.interruptActiveChangeElementPropertyAction();
  },
});

const disableValidation = {
  withValidationIcon: false,
  areValidationClassesEnabled: false,
};

/**
 * @type {Utils.FormComponent.TextField}
 */
const TitleField = TextField.extend({
  ...disableValidation,
  name: 'title',
  isOptional: true,
});

/**
 * @type {Utils.FormComponent.TextareaField}
 */
const TitleTipField = TextareaField.extend({
  ...disableValidation,
  name: 'titleTip',
  isOptional: true,
});

/**
 * @type {Utils.FormComponent.TextareaField}
 */
const DescriptionField = TextareaField.extend({
  ...disableValidation,
  name: 'description',
  isOptional: true,
});

const DetailsForm = FormFieldsRootGroup.extend({
  /**
   * @override
   */
  i18nPrefix: tag `${'component.i18nPrefix'}.fields`,

  /**
   * @virtual
   * @type {Components.AtmWorkflow.ChartsDashboardEditor.SectionsEditor.SectionDetailsEditor}
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
  fields: computed(() => [
    TitleField.create(),
    TitleTipField.create(),
    DescriptionField.create(),
  ]),

  /**
   * @override
   */
  onValueChange(value, field) {
    this._super(...arguments);
    this.component.onValueChange(field.name, value);
  },

  /**
   * @override
   */
  onFocusLost() {
    this._super(...arguments);
    this.component.onEditionInterrupted();
  },
});
