/**
 * Shows "chart elements" section of chart editor. Contains three types of
 * elements (grouped in separate tabs):
 * - series,
 * - series groups,
 * - axes.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { inject as service } from '@ember/service';
import EmberObject, { computed } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import { dasherize } from '@ember/string';
import { getBy } from 'ember-awesome-macros';
import _ from 'lodash';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import OwnerInjector from 'onedata-gui-common/mixins/owner-injector';
import {
  ElementType,
  chartElementIcons,
  translateValidationErrorsBatch,
} from 'onedata-gui-common/utils/atm-workflow/chart-dashboard-editor';
import layout from 'onedata-gui-common/templates/components/atm-workflow/chart-dashboard-editor/chart-editor/elements';

export default Component.extend(I18n, {
  layout,
  classNames: ['chart-editor-elements'],

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.atmWorkflow.chartDashboardEditor.chartEditor.elements',

  /**
   * @virtual
   * @type {Utils.AtmWorkflow.ChartDashboardEditor.Chart}
   */
  chart: undefined,

  /**
   * @virtual
   * @type {Utils.AtmWorkflow.ChartDashboardEditor.EditorContext}
   */
  editorContext: undefined,

  /**
   * @type {string}
   */
  activeTabId: undefined,

  /**
   * @type {ComputedProperty<Array<ElementsTab>>}
   */
  tabs: computed('chart', function tabs() {
    return [
      ElementsTab.create({
        ownerSource: this,
        name: 'series',
        icon: chartElementIcons[ElementType.Series],
        componentName: 'series-list',
        chart: this.chart,
      }),
      ElementsTab.create({
        ownerSource: this,
        name: 'seriesGroups',
        icon: chartElementIcons[ElementType.SeriesGroup],
        componentName: 'series-groups-list',
        chart: this.chart,
      }),
      ElementsTab.create({
        ownerSource: this,
        name: 'axes',
        icon: chartElementIcons[ElementType.Axis],
        componentName: 'axes-list',
        chart: this.chart,
      }),
    ];
  }),

  /**
   * @override
   */
  init() {
    this._super(...arguments);
    if (!this.activeTabId) {
      this.set('activeTabId', this.tabs[0].id);
    }
  },
});

const ElementsTab = EmberObject.extend(OwnerInjector, {
  i18n: service(),

  /**
   * @public
   * @virtual
   * @type {Utils.AtmWorkflow.ChartDashboardEditor.Chart}
   */
  chart: undefined,

  /**
   * @public
   * @virtual
   * @type {string}
   */
  name: undefined,

  /**
   * @public
   * @virtual
   * @type {string}
   */
  icon: undefined,

  /**
   * @public
   * @virtual
   * @type {string}
   */
  componentName: undefined,

  /**
   * @public
   * @type {ComputedProperty<string>}
   */
  id: computed('name', function id() {
    return `${guidFor(this)}-${dasherize(this.name)}`;
  }),

  /**
   * @private
   * @type {ComputedProperty<Array<Utils.AtmWorkflow.ChartDashboardEditor.ChartElement>>}
   */
  elements: getBy('chart', 'name'),

  /**
   * @public
   * @type {ComputedProperty<SafeString | null>}
   */
  validationErrorsMessage: computed(
    'elements.@each.validationErrors',
    function validationErrorsMessage() {
      const validationErrors = _.flatten(
        this.elements.map(({ validationErrors }) => validationErrors)
      );
      return translateValidationErrorsBatch(this.i18n, validationErrors);
    }
  ),
});
