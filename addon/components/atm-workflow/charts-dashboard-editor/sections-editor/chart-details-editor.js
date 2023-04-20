import Component from '@ember/component';
import { computed, observer, set } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { tag } from 'ember-awesome-macros';
import TextField from 'onedata-gui-common/utils/form-component/text-field';
import TextareaField from 'onedata-gui-common/utils/form-component/textarea-field';
import FormFieldsRootGroup from 'onedata-gui-common/utils/form-component/form-fields-root-group';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import layout from 'onedata-gui-common/templates/components/atm-workflow/charts-dashboard-editor/sections-editor/chart-details-editor';

export default Component.extend(I18n, {
  classNames: ['chart-details-editor'],
  layout,

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.atmWorkflow.chartsDashboardEditor.sectionsEditor.chartDetailsEditor',

  /**
   * @virtual
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.Chart}
   */
  chart: null,

  /**
   * @virtual
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.SectionsEditorActionsFactory}
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
    'chart.{title,titleTip}',
    function formValuesUpdater() {
      ['title', 'titleTip'].forEach((fieldName) => {
        const newValue = this.chart?.[fieldName] ?? '';
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
        changeType = 'continuous';
        break;
      default:
        changeType = 'discrete';
        break;
    }

    const action = this.actionsFactory.createChangeElementPropertyAction({
      element: this.chart,
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

  actions: {
    /**
     * @returns {void}
     */
    editContent() {
      const action = this.actionsFactory.createEditChartContentAction({
        chart: this.chart,
      });
      action.execute();
    },
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
 * @type {Utils.FormComponent.TextField}
 */
const TitleTipField = TextareaField.extend({
  ...disableValidation,
  name: 'titleTip',
  isOptional: true,
});

const DetailsForm = FormFieldsRootGroup.extend({
  /**
   * @virtual
   * @type {Components.AtmWorkflow.ChartsDashboardEditor.SectionsEditor.ChartDetailsEditor}
   */
  component: undefined,

  /**
   * @override
   */
  ownerSource: reads('component'),

  /**
   * @override
   */
  i18nPrefix: tag `${'component.i18nPrefix'}.fields`,

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
