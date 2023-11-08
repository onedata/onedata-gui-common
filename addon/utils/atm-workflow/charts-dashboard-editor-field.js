import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import FormField from 'onedata-gui-common/utils/form-component/form-field';

/**
 * @typedef {EmberObject} DashboardModelOwner
 * @property {ChartsDashboardEditorModelContainer} chartsDashboardEditorModelContainer
 */

export default FormField.extend({
  modalManager: service(),

  /**
   * @override
   */
  i18nPrefix: 'utils.atmWorkflow.chartsDashboardEditorField',

  /**
   * Do not take parent fields group translation path into account
   * @override
   */
  translationPath: '',

  /**
   * @override
   */
  fieldComponentName: 'atm-workflow/charts-dashboard-editor-field',

  /**
   * @override
   */
  isOptional: true,

  /**
   * @override
   */
  withValidationIcon: false,

  /**
   * @override
   */
  withValidationMessage: false,

  /**
   * @virtual
   * @type {DashboardModelOwner}
   */
  dashboardModelOwner: undefined,

  /**
   * @type {ComputedProperty<SafeString>}
   */
  buttonLabel: computed('i18nPrefix', function buttonLabel() {
    return this.getTranslation('buttonLabel', {}, { defaultValue: null });
  }),

  /**
   * @public
   */
  async showEditor() {
    await this.modalManager.show('workflow-visualiser/charts-modal', {
      mode: 'edit',
      dashboardOwner: this.dashboardModelOwner,
      onSubmit: () => {
        const newDashboardSpec = this.dashboardModelOwner
          .chartsDashboardEditorModelContainer.dashboardModel.toJson();
        this.valueChanged(newDashboardSpec);
      },
    }).hiddenPromise;
  },
});
