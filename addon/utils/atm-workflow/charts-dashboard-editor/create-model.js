/**
 * A set of functions which are responsible for creating editor model (from
 * given spec of from scratch).
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { set } from '@ember/object';
import Model from './model';
import Section from './section';
import Chart from './chart';

/**
 * @type {string}
 */
const i18nPrefix = 'utils.atmWorkflow.chartsDashboardEditor.createModel';

/**
 * Converts raw charts dashboard spec into a model used by dashboard editor.
 * @param {AtmTimeSeriesDashboardSpec | null} dashboardSpec
 * @returns {Utils.AtmWorkflow.ChartsDashboardEditor.Model}
 */
export function createModelFromSpec(dashboardSpec) {
  const rootSection = dashboardSpec?.rootSection ?
    createSectionModelFromSpec(dashboardSpec.rootSection, true) : null;

  return Model.create({
    rootSection,
  });
}

/**
 * Returns new, empty section.
 * @param {Ember.Service} i18n
 * @param {boolean} [isRoot]
 * @returns {Utils.AtmWorkflow.ChartsDashboardEditor.Section}
 */
export function createNewSection(i18n, isRoot = false) {
  return createSectionModelFromSpec({
    title: String(i18n.t(`${i18nPrefix}.newSection.title`)),
  }, isRoot);
}

/**
 * Returns new, empty chart.
 * @param {Ember.Service} i18n
 * @returns {Utils.AtmWorkflow.ChartsDashboardEditor.Chart}
 */
export function createNewChart(i18n) {
  return createChartModelFromSpec({
    title: String(i18n.t(`${i18nPrefix}.newChart.title`)),
  });
}

/**
 * @param {Partial<OneTimeSeriesChartsSectionSpec>} sectionSpec
 * @param {boolean} [isRoot]
 * @returns {Utils.AtmWorkflow.ChartsDashboardEditor.Section}
 */
function createSectionModelFromSpec(sectionSpec, isRoot = false) {
  const section = Section.create({
    isRoot,
    title: sectionSpec.title ?? '',
    titleTip: sectionSpec.titleTip ?? '',
    description: sectionSpec.description ?? '',
    charts: sectionSpec.charts
      ?.filter(Boolean)
      .map((chartSpec) => createChartModelFromSpec(chartSpec)) ?? [],
    sections: sectionSpec.sections
      ?.filter(Boolean)
      .map((sectionSpec) => createSectionModelFromSpec(sectionSpec)) ?? [],
  });
  section.charts.forEach((chart) => set(chart, 'parentSection', section));
  section.sections.forEach((subsection) => set(subsection, 'parentSection', section));
  return section;
}

/**
 * @param {Partial<OTSCChartDefinition>} chartSpec
 * @returns {Utils.AtmWorkflow.ChartsDashboardEditor.Chart}
 */
function createChartModelFromSpec(chartSpec) {
  const chart = Chart.create({
    title: chartSpec.title ?? '',
    titleTip: chartSpec.titleTip ?? '',
  });
  return chart;
}
