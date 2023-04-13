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
 * @param {unknown} elementsOwner
 * @returns {Utils.AtmWorkflow.ChartsDashboardEditor.Model}
 */
export function createModelFromSpec(dashboardSpec, elementsOwner) {
  const rootSection = dashboardSpec?.rootSection ?
    createSectionModelFromSpec(dashboardSpec.rootSection, elementsOwner, true) : null;

  return Model.create({
    rootSection,
  });
}

/**
 * Returns new, empty section.
 * @param {Ember.Service} i18n
 * @param {unknown} [elementOwner]
 * @param {boolean} [isRoot]
 * @returns {Utils.AtmWorkflow.ChartsDashboardEditor.Section}
 */
export function createNewSection(i18n, elementOwner = null, isRoot = false) {
  return createSectionModelFromSpec({
    title: {
      content: String(i18n.t(`${i18nPrefix}.newSection.title`)),
    },
  }, elementOwner, isRoot);
}

/**
 * Returns new, empty chart.
 * @param {Ember.Service} i18n
 * @param {unknown} [elementOwner]
 * @returns {Utils.AtmWorkflow.ChartsDashboardEditor.Chart}
 */
export function createNewChart(i18n, elementOwner = null) {
  return createChartModelFromSpec({
    title: {
      content: String(i18n.t(`${i18nPrefix}.newChart.title`)),
    },
  }, elementOwner);
}

/**
 * @param {Partial<OneTimeSeriesChartsSectionSpec>} sectionSpec
 * @param {unknown} [elementOwner]
 * @param {boolean} [isRoot]
 * @returns {Utils.AtmWorkflow.ChartsDashboardEditor.Section}
 */
function createSectionModelFromSpec(sectionSpec, elementOwner = null, isRoot = false) {
  const section = Section.create({
    elementOwner,
    isRoot,
    title: sectionSpec.title?.content ?? '',
    titleTip: sectionSpec.title?.tip ?? '',
    description: sectionSpec.description ?? '',
    charts: sectionSpec.charts
      ?.filter(Boolean)
      .map((chartSpec) => createChartModelFromSpec(chartSpec, elementOwner)) ?? [],
    sections: sectionSpec.sections
      ?.filter(Boolean)
      .map((sectionSpec) => createSectionModelFromSpec(sectionSpec, elementOwner)) ?? [],
  });
  section.charts.forEach((chart) => set(chart, 'parentSection', section));
  section.sections.forEach((subsection) => set(subsection, 'parentSection', section));
  return section;
}

/**
 * @param {Partial<OTSCChartDefinition>} chartSpec
 * @param {unknown} [elementOwner]
 * @returns {Utils.AtmWorkflow.ChartsDashboardEditor.Chart}
 */
function createChartModelFromSpec(chartSpec, elementOwner = null) {
  const chart = Chart.create({
    elementOwner,
    title: chartSpec.title?.content ?? '',
    titleTip: chartSpec.title?.tip ?? '',
  });
  return chart;
}
