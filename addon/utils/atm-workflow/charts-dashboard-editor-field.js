/**
 * Allows to edit/view charts dashboard using modal with dashboard editor.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import FormField from 'onedata-gui-common/utils/form-component/form-field';

export default FormField.extend({
  modalManager: service(),

  /**
   * @virtual
   * @type {DashboardModelOwner}
   */
  dashboardModelOwner: undefined,

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
  defaultValue: null,

  /**
   * @override
   */
  withValidationIcon: false,

  /**
   * @override
   */
  withValidationMessage: false,

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
    await this.modalManager.show('workflow-visualiser/charts-dashboard-editor-modal', {
      mode: this.isInViewMode ? 'view' : 'edit',
      dashboardOwner: this.dashboardModelOwner,
      onSubmit: () => {
        const newDashboardSpec = this.dashboardModelOwner
          .chartsDashboardEditorModelContainer.dashboardModel.toJson();
        this.valueChanged(newDashboardSpec);
      },
    }).hiddenPromise;
  },
});
