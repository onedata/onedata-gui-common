/**
 * A modal that allows to view and modify charts dashboard.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import layout from 'onedata-gui-common/templates/components/modals/workflow-visualiser/charts-modal';
import { reads } from '@ember/object/computed';
import { trySet, set, observer } from '@ember/object';
import FormFieldsRootGroup from 'onedata-gui-common/utils/form-component/form-fields-root-group';
import {
  default as ChartsDashboardEditor,
  formValuesToChartsDashboardSpec,
  chartsDashboardSpecToFormValue
} from 'onedata-gui-common/utils/atm-workflow/charts-dashboard-editor';
import { tag, not } from 'ember-awesome-macros';

/**
 * @typedef {Object} WorkflowVisualiserChartsModalOptions
 * @property {'edit'|'view'} mode
 * @property {'lane'|'workflow'} dashboardOwnerType
 * @property {AtmTimeSeriesDashboardSpec|null} dashboardSpec
 */

export default Component.extend(I18n, {
  layout,
  tagName: '',

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.modals.workflowVisualiser.chartsModal',

  /**
   * @virtual
   * @type {string}
   */
  modalId: undefined,

  /**
   * @virtual
   * @type {WorkflowVisualiserChartsModalOptions}
   */
  modalOptions: undefined,

  /**
   * Initial value is set on init
   * @type {'visualisation'|'definition'}
   */
  activeTab: undefined,

  /**
   * @type {boolean}
   */
  isSubmitting: false,

  /**
   * @type {ComputedProperty<'edit'|'view'>}
   */
  mode: reads('modalOptions.mode'),

  /**
   * @type {ComputedProperty<'lane'|'workflow'>}
   */
  dashboardOwnerType: reads('modalOptions.dashboardOwnerType'),

  /**
   * @type {ComputedProperty<AtmTimeSeriesDashboardSpec|null>}
   */
  dashboardSpec: reads('modalOptions.dashboardSpec'),

  /**
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsRootGroup>}
   */
  definitionFieldsRootGroup: computed(function definitionFieldsRootGroup() {
    return DefinitionFieldsRootGroup.create({ component: this });
  }),

  definitionFormValuesSetter: observer(
    'dashboardSpec',
    function definitionFormValuesSetter() {
      set(
        this.definitionFieldsRootGroup.valuesSource,
        'dashboardSpec',
        chartsDashboardSpecToFormValue(this.dashboardSpec)
      );
    }
  ),

  /**
   * @override
   */
  init() {
    this._super(...arguments);
    this.set('activeTab', this.mode === 'view' ? 'visualisation' : 'definition');
    this.definitionFieldsRootGroup.reset();
    if (this.mode === 'view') {
      this.definitionFieldsRootGroup.changeMode('view');
    }
    this.definitionFormValuesSetter();
  },

  actions: {
    async submit(submitCallback) {
      this.set('isSubmitting', true);
      const newDashboardSpec = formValuesToChartsDashboardSpec(
        this.definitionFieldsRootGroup.dumpValue()?.dashboardSpec
      );
      try {
        return await submitCallback(newDashboardSpec);
      } finally {
        trySet(this, 'isSubmitting', false);
      }
    },
  },
});

const DefinitionFieldsRootGroup = FormFieldsRootGroup.extend({
  /**
   * @type {Components.Modals.WorkflowVisualiser.ChartsModal}
   * @virtual
   */
  component: undefined,

  /**
   * @override
   */
  i18nPrefix: tag `${'component.i18nPrefix'}.tabs.definition.fields`,

  /**
   * @override
   */
  ownerSource: reads('component'),

  /**
   * @override
   */
  isEnabled: not('component.isSubmitting'),

  /**
   * @override
   */
  fields: computed(() => [
    ChartsDashboardEditor.create({ name: 'dashboardSpec' }),
  ]),
});
