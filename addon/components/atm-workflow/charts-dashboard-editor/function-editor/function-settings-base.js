import Component from '@ember/component';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { dasherize } from '@ember/string';
import { getOwner } from '@ember/application';
import { tag } from 'ember-awesome-macros';
import FormFieldsRootGroup from 'onedata-gui-common/utils/form-component/form-fields-root-group';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import layout from 'onedata-gui-common/templates/components/atm-workflow/charts-dashboard-editor/function-editor/function-settings-base';

export default Component.extend(I18n, {
  layout,
  classNames: ['function-settings'],
  classNameBindings: ['functionBasedClassName'],

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: tag `components.atmWorkflow.chartsDashboardEditor.functionEditor.${'chartFunction.name'}Settings`,

  /**
   * @virtual
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.FunctionsModel.Literal}
   */
  chartFunction: undefined,

  /**
   * @virtual
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.ActionsFactory}
   */
  actionsFactory: undefined,

  /**
   * @type {ComputedProperty<string>}
   */
  functionBasedClassName: computed('chartFunction.name', function functionBasedClassName() {
    return `${dasherize(this.chartFunction.name)}-settings`;
  }),

  /**
   * @virtual
   * @param {string} fieldName
   * @param {string} value
   */
  onValueChange() {},

  /**
   * @returns {void}
   */
  onEditionInterrupted() {
    this.actionsFactory.interruptActiveChangeElementPropertyAction();
  },
});

/**
 * @type {Utils.FormComponent.FormFieldsRootGroup}
 */
export const SettingsForm = FormFieldsRootGroup.extend({
  /**
   * @virtual
   * @type {Components.AtmWorkflow.ChartsDashboardEditor.FunctionEditor.FunctionSettingsBase}
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
  onValueChange(value, field) {
    this._super(...arguments);
    if (!getOwner(field)) {
      // Not initialized field
      return;
    }
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
