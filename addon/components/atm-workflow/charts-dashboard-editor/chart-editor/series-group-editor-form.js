import Component from '@ember/component';
import { computed, observer, set } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { tag } from 'ember-awesome-macros';
import TextField from 'onedata-gui-common/utils/form-component/text-field';
import ToggleField from 'onedata-gui-common/utils/form-component/toggle-field';
import FormFieldsRootGroup from 'onedata-gui-common/utils/form-component/form-fields-root-group';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import layout from 'onedata-gui-common/templates/components/atm-workflow/charts-dashboard-editor/chart-editor/series-group-editor-form';

export default Component.extend(I18n, {
  layout,
  tagName: 'form',
  classNames: ['series-group-editor-form', 'form', 'form-horizontal', 'form-component'],

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.atmWorkflow.chartsDashboardEditor.chartEditor.seriesGroupEditorForm',

  /**
   * @virtual
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.SeriesGroup}
   */
  seriesGroup: undefined,

  /**
   * @virtual
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.ActionsFactory}
   */
  actionsFactory: undefined,

  /**
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsRootGroup>}
   */
  form: computed(function form() {
    return Form.create({
      component: this,
    });
  }),

  formValuesUpdater: observer(
    'seriesGroup.{name,stacked,showSum}',
    function formValuesUpdater() {
      ['name', 'stacked', 'showSum'].forEach((fieldName) => {
        const newValue = this.seriesGroup?.[fieldName] ?? '';
        if (newValue !== this.form.valuesSource[fieldName]) {
          set(this.form.valuesSource, fieldName, newValue);
        }
      });

      this.form.invalidFields.forEach((field) => field.markAsModified());
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
      case 'name':
        changeType = 'continuous';
        break;
      case 'stacked':
      case 'showSum':
      default:
        changeType = 'discrete';
        break;
    }

    const action = this.actionsFactory.createChangeElementPropertyAction({
      element: this.seriesGroup,
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

/**
 * @type {Utils.FormComponent.TextField}
 */
const NameField = TextField.extend({
  name: 'name',
});

/**
 * @type {Utils.FormComponent.ToggleField}
 */
const StackedField = ToggleField.extend({
  name: 'stacked',
  defaultValue: false,
});

/**
 * @type {Utils.FormComponent.ToggleField}
 */
const ShowSumField = ToggleField.extend({
  name: 'showSum',
  defaultValue: false,
});

const Form = FormFieldsRootGroup.extend({
  /**
   * @virtual
   * @type {Components.AtmWorkflow.ChartsDashboardEditor.ChartEditor.SeriesGroupEditorForm}
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
    NameField.create(),
    StackedField.create(),
    ShowSumField.create(),
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
