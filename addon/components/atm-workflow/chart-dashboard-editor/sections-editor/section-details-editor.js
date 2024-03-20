/**
 * Allows edition of section details - title, title tip, description and more.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed, observer, set } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { tag, not } from 'ember-awesome-macros';
import TextField from 'onedata-gui-common/utils/form-component/text-field';
import TextareaField from 'onedata-gui-common/utils/form-component/textarea-field';
import DropdownField from 'onedata-gui-common/utils/form-component/dropdown-field';
import FormFieldsRootGroup from 'onedata-gui-common/utils/form-component/form-fields-root-group';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import layout from 'onedata-gui-common/templates/components/atm-workflow/chart-dashboard-editor/sections-editor/section-details-editor';
import { chartNavigationsArray, translateChartNavigation } from 'onedata-gui-common/utils/time-series-dashboard';

export default Component.extend(I18n, {
  classNames: ['section-details-editor'],
  layout,

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.atmWorkflow.chartDashboardEditor.sectionsEditor.sectionDetailsEditor',

  /**
   * @virtual
   * @type {Utils.AtmWorkflow.ChartDashboardEditor.Section}
   */
  section: undefined,

  /**
   * @virtual
   * @type {Utils.AtmWorkflow.ChartDashboardEditor.EditorContext}
   */
  editorContext: undefined,

  /**
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsRootGroup>}
   */
  detailsForm: computed(function detailsForm() {
    return DetailsForm.create({
      component: this,
    });
  }),

  formValuesUpdater: observer(
    'section.{title,titleTip,description,chartNavigation}',
    function formValuesUpdater() {
      ['title', 'titleTip', 'description', 'chartNavigation'].forEach((fieldName) => {
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
      case 'chartNavigation':
      default:
        changeType = 'discrete';
        break;
    }

    const action = this.editorContext.actionsFactory.createChangeElementPropertyAction({
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
    this.editorContext.actionsFactory.interruptActiveChangeElementPropertyAction();
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

/**
 * @type {Utils.FormComponent.DropdownField}
 */
const ChartNavigationField = DropdownField.extend({
  ...disableValidation,
  name: 'chartNavigation',
  showSearch: false,
  options: computed(function options() {
    return chartNavigationsArray.map((value) => ({
      label: translateChartNavigation(this.i18n, value),
      value,
    }));
  }),
});

const DetailsForm = FormFieldsRootGroup.extend({
  /**
   * @override
   */
  i18nPrefix: tag `${'component.i18nPrefix'}.fields`,

  /**
   * @virtual
   * @type {Components.AtmWorkflow.ChartDashboardEditor.SectionsEditor.SectionDetailsEditor}
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
  isEnabled: not('component.editorContext.isReadOnly'),

  /**
   * @override
   */
  fields: computed(() => [
    TitleField.create(),
    TitleTipField.create(),
    DescriptionField.create(),
    ChartNavigationField.create(),
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
