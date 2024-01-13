/**
 * A field element component which renders charts dashboard editor.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import FieldComponentBase from 'onedata-gui-common/components/form-component/field-component-base';
import layout from 'onedata-gui-common/templates/components/atm-workflow/charts-dashboard-editor-field';
import { ElementType } from 'onedata-gui-common/utils/atm-workflow/charts-dashboard-editor';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default FieldComponentBase.extend(I18n, {
  layout,
  classNames: ['charts-dashboard-editor-field'],

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'utils.atmWorkflow.chartsDashboardEditorField',

  /**
   * @type {ComputedProperty<DashboardModelOwner>}
   */
  dashboardModelOwner: reads('field.dashboardModelOwner'),

  /**
   * @type {ComputedProperty<SafeString>}
   */
  buttonLabel: reads('field.buttonLabel'),

  /**
   * @type {ComputedProperty<Array<{ text: SafeString, class: string }>>}
   */
  contentLabels: computed(
    'value',
    'dashboardModelOwner.chartsDashboardEditorModelContainer.dashboardModel',
    function contentLabels() {
      const dashboardModel =
        this.dashboardModelOwner?.chartsDashboardEditorModelContainer?.dashboardModel;
      if (!dashboardModel?.rootSection) {
        return [{
          text: this.t('contentLabels.empty'),
          class: 'default',
        }];
      }

      const nestedDashboardElements = [...dashboardModel.rootSection.nestedElements()];
      const sectionsCount = 1 + nestedDashboardElements
        .filter(({ elementType }) => elementType === ElementType.Section).length;
      const chartsCount = nestedDashboardElements
        .filter(({ elementType }) => elementType === ElementType.Chart).length;

      return [
          ['sections', sectionsCount],
          ['charts', chartsCount],
        ]
        .map(([resource, count]) => ({
          text: this.t(
            `contentLabels.${resource}.${count === 1 ? 'singular' : 'plural'}`, {
              count,
            }),
          class: count > 0 ? 'success' : 'default',
        }));
    }
  ),

  actions: {
    showEditor() {
      return this.field.showEditor();
    },
  },
});
